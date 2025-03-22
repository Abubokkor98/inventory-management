import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { DatabaseService } from 'src/database/database.service';
import { PRStatus } from '@prisma/client';

@Injectable()
export class PurchaseOrdersService {
  constructor(private readonly databaseService: DatabaseService) {}
  async createPurchaseOrder(dto: CreatePurchaseOrderDto) {
    try {
      return this.databaseService.$transaction(async (prisma) => {
        // 1. Validate Purchase Request
        const purchaseRequest = await prisma.purchaseRequest.findUnique({
          where: { id: dto.purchaseRequestId },
          include: { items: true },
        });

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

  async update(id: number, updatePurchaseOrderDto: UpdatePurchaseOrderDto) {
    return `This action updates a #${id} purchaseOrder`;
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
