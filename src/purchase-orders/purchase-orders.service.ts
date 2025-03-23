import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { DatabaseService } from 'src/database/database.service';
import { POStatus, PRStatus } from '@prisma/client';

@Injectable()
export class PurchaseOrdersService {
  constructor(private readonly databaseService: DatabaseService) {}
  async create(dto: CreatePurchaseOrderDto) {
    try {
      return this.databaseService.$transaction(async (prisma) => {
        // 1. Validate Purchase Request
        const purchaseRequest = await prisma.purchaseRequest.findUnique({
          where: { id: dto.purchaseRequestId },
          include: { items: true },
        });
        // todo: status over
        if (!purchaseRequest)
          throw new NotFoundException('Purchase request not found');
        if (purchaseRequest.status === PRStatus.COMPLETE)
          throw new BadRequestException('Request already fulfilled');

        // 2. Validate Each Item
        const updatedItems = await Promise.all(
          dto.items.map(async (orderItem) => {
            const prItem = purchaseRequest.items.find(
              (i) => i.itemId === orderItem.itemId,
            );
            if (!prItem)
              throw new NotFoundException(
                `Item ${orderItem.itemId} not found in request`,
              );

            // todo: status over
            if (orderItem.quantity > prItem.leftQuantity) {
              throw new BadRequestException(
                `Insufficient quantity for item ${orderItem.itemId}`,
              );
            }

            // 3. Update Left Quantity
            return prisma.purchaseRequestItem.update({
              where: { id: prItem.id },
              data: { leftQuantity: prItem.leftQuantity - orderItem.quantity },
            });
          }),
        );

        // 4. Calculate New Left Quantity
        const newLeftQty = updatedItems.reduce(
          (sum, item) => sum + item.leftQuantity,
          0,
        );

        // 5. Update Purchase Request Status
        let newStatus: PRStatus = purchaseRequest.status;
        if (newLeftQty === 0) {
          newStatus = PRStatus.COMPLETE;
        } else if (newLeftQty < purchaseRequest.totalQty) {
          newStatus = PRStatus.PARTIAL;
        }

        await prisma.purchaseRequest.update({
          where: { id: dto.purchaseRequestId },
          data: {
            leftQty: newLeftQty,
            status: newStatus,
          },
        });

        // 6. Calculate Total Price
        const totalPrice = dto.items.reduce((sum, item) => {
          const prItem = purchaseRequest.items.find(
            (i) => i.itemId === item.itemId,
          );
          if (!prItem)
            throw new NotFoundException(
              `Item ${item.itemId} not found in request`,
            );
          return sum + prItem.price * item.quantity;
        }, 0);

        // 7. Create Purchase Order
        return prisma.purchaseOrder.create({
          data: {
            purchaseRequestId: dto.purchaseRequestId,
            totalQty: dto.items.reduce((sum, i) => sum + i.quantity, 0),
            remainingQty: dto.items.reduce((sum, i) => sum + i.quantity, 0),
            totalPrice: totalPrice,
            status: PRStatus.WAITING,
            items: {
              create: dto.items.map((item) => {
                const prItem = purchaseRequest.items.find(
                  (i) => i.itemId === item.itemId,
                );
                if (!prItem)
                  throw new NotFoundException(
                    `Item ${item.itemId} not found in request`,
                  );

                return {
                  itemId: item.itemId,
                  quantity: item.quantity,
                  price: prItem.price,
                  remainingQty: item.quantity,
                };
              }),
            },
          },
          include: { items: true },
        });
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error; // Let NestJS handle known errors
      }
      console.error('Error creating purchase order:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the purchase order',
      );
    }
  }

  async findAll() {
    return this.databaseService.purchaseOrder.findMany();
  }

  async findOne(id: string) {
    const request = await this.databaseService.purchaseOrder.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException(`Purchase order with ID ${id} not found`);
    }
    return request;
  }

  async update(id: string, dto: UpdatePurchaseOrderDto) {
    try {
      return this.databaseService.$transaction(async (prisma) => {
        // 1. Get existing purchase order with items
        const existingOrder = await prisma.purchaseOrder.findUnique({
          where: { id },
          include: { items: true },
        });

        if (!existingOrder) {
          throw new NotFoundException('Purchase order not found');
        }

        // 2. Validate order status
        if (existingOrder.status !== POStatus.WAITING) {
          throw new BadRequestException('Only WAITING orders can be modified');
        }

        // 3. Get related purchase request
        const purchaseRequest = await prisma.purchaseRequest.findUnique({
          where: { id: existingOrder.purchaseRequestId },
          include: { items: true },
        });

        if (!purchaseRequest) {
          throw new NotFoundException('Associated purchase request not found');
        }

        // Ensure dto.items is an array
        const items = dto.items ?? [];

        if (items.length === 0) {
          throw new BadRequestException(
            'At least one item must be provided for update',
          );
        }

        // 4. Update leftQuantity in purchase request when reducing/increasing quantity
        const errors: string[] = [];

        await Promise.all(
          existingOrder.items.map(async (orderItem) => {
            const prItem = purchaseRequest.items.find(
              (i) => i.itemId === orderItem.itemId,
            );
            if (!prItem) return;

            const newItem = items.find((i) => i.itemId === orderItem.itemId);

            if (newItem) {
              //quantity update
              if (newItem.quantity < orderItem.quantity) {
                const difference = orderItem.quantity - newItem.quantity;
                await prisma.purchaseRequestItem.update({
                  where: { id: prItem.id },
                  data: {
                    leftQuantity: prItem.leftQuantity + difference,
                  },
                });
              }
              // Quantity increase
              else if (newItem.quantity > orderItem.quantity) {
                const difference = newItem.quantity - orderItem.quantity;

                if (difference > prItem.leftQuantity) {
                  errors.push(
                    `Item ${newItem.itemId} exceeds available quantity. ` +
                      `Available: ${prItem.leftQuantity}, Requested increase: ${difference}`,
                  );
                } else {
                  // Valid quantity increase
                  await prisma.purchaseRequestItem.update({
                    where: { id: prItem.id },
                    data: {
                      leftQuantity: prItem.leftQuantity - difference,
                    },
                  });
                }
              }
            }
          }),
        );

        // Check for errors
        if (errors.length > 0) {
          throw new BadRequestException({
            message: 'Order update failed',
            errors,
          });
        }

        // 5. Validate and process new items
        const validItems = await Promise.all(
          items.map(async (newItem) => {
            const prItem = purchaseRequest.items.find(
              (i) => i.itemId === newItem.itemId,
            );

            if (!prItem) {
              errors.push(
                `Item ${newItem.itemId} not found in original request`,
              );
              return null;
            }

            if (newItem.quantity > prItem.leftQuantity) {
              errors.push(
                `Insufficient quantity for item ${newItem.itemId}. ` +
                  `Requested: ${newItem.quantity}, Available: ${prItem.leftQuantity}`,
              );
              return null;
            }

            // Update purchase request item
            await prisma.purchaseRequestItem.update({
              where: { id: prItem.id },
              data: {
                leftQuantity: prItem.leftQuantity - newItem.quantity,
              },
            });

            return {
              itemId: newItem.itemId,
              quantity: newItem.quantity,
              price: prItem.price,
              remainingQty: newItem.quantity,
            };
          }),
        );

        // Remove null items
        const filteredValidItems = validItems.filter(
          (item) => item !== null,
        ) as {
          itemId: string;
          quantity: number;
          price: number;
          remainingQty: number;
        }[];

        if (errors.length > 0) {
          throw new BadRequestException({
            message: 'Order update failed',
            errors,
          });
        }

        // 6. Calculate new totals
        const totalQty = filteredValidItems.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        const totalPrice = filteredValidItems.reduce(
          (sum, item) => sum + item.quantity * item.price,
          0,
        );

        // 7. Update purchase order
        const updatedOrder = await prisma.purchaseOrder.update({
          where: { id },
          data: {
            totalQty,
            remainingQty: totalQty,
            totalPrice,
            items: {
              deleteMany: {}, // Remove all existing items
              create: filteredValidItems.map((item) => ({
                itemId: item.itemId,
                quantity: item.quantity,
                price: item.price,
                remainingQty: item.remainingQty,
              })),
            },
          },
          include: { items: true },
        });

        // 8. Update purchase request status
        const newLeftQty = purchaseRequest.items.reduce(
          (sum, item) => sum + item.leftQuantity,
          0,
        );

        let newStatus: PRStatus = purchaseRequest.status;
        if (newLeftQty === 0) {
          newStatus = PRStatus.COMPLETE;
        } else if (newLeftQty < purchaseRequest.totalQty) {
          newStatus = PRStatus.PARTIAL;
        }

        await prisma.purchaseRequest.update({
          where: { id: purchaseRequest.id },
          data: {
            leftQty: newLeftQty,
            status: newStatus,
          },
        });

        return updatedOrder;
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error updating purchase order:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating the purchase order',
      );
    }
  }

  async remove(id: string) {
    // Check if the purchase order exists
    const existingOrder = await this.databaseService.purchaseOrder.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      throw new NotFoundException(`Purchase order with ID ${id} not found`);
    }

    // Proceed with deletion
    return await this.databaseService.purchaseOrder.delete({
      where: { id },
    });
  }
}
