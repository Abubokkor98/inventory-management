import { PRStatus } from '@prisma/client';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import {
  CreatePurchaseRequestDto,
  PurchaseRequestItemDto,
} from './dto/create-purchase-request.dto';
import { UpdatePurchaseRequestDto } from './dto/update-purchase-request.dto';

@Injectable()
export class PurchaseRequestsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createPurchaseRequest(dto: CreatePurchaseRequestDto) {
    return this.databaseService.$transaction(async (prisma) => {
      const itemsWithDetails = await Promise.all(
        dto.items.map(async (item) => {
          const itemMaster = await prisma.itemMaster.findUnique({
            where: { id: item.itemId },
            include: { stock: true },
          });

          if (!itemMaster) {
            throw new NotFoundException(`Item ${item.itemId} not found`);
          }
          // todo: don't need to check stock quantity
          if (!itemMaster.stock || itemMaster.stock.quantity < item.quantity) {
            throw new BadRequestException(
              `Insufficient stock for item ${itemMaster.sku}. Available: ${itemMaster.stock?.quantity || 0}`,
            );
          }

          return {
            ...item,
            price: itemMaster.price,
            leftQuantity: item.quantity,
          };
        }),
      );

      const totalQty = itemsWithDetails.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

      const purchaseRequest = await prisma.purchaseRequest.create({
        data: {
          totalQty,
          leftQty: totalQty,
          totalPrice: itemsWithDetails.reduce(
            (sum, item) => sum + item.quantity * item.price,
            0,
          ),
          status: PRStatus.WAITING,
          items: {
            create: itemsWithDetails.map((item) => ({
              itemId: item.itemId,
              quantity: item.quantity,
              price: item.price,
              leftQuantity: item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      return purchaseRequest;
    });
  }

  //todo: i commented this code for my learning purpose
  // async findAll() {
  //   return this.databaseService.purchaseRequest.findMany({
  //     include: {
  //       items: {
  //         include: {
  //           item: true,
  //         },
  //       },
  //     },
  //   });
  // }
  async findAll() {
    return this.databaseService.purchaseRequest.findMany({
      include: {
        items: true,
      },
    });
  }

  async findOne(id: string) {
    const request = await this.databaseService.purchaseRequest.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!request) {
      throw new NotFoundException(`Purchase request with ID ${id} not found`);
    }
    return request;
  }

  // todo: facing problem with update , will change it later

  async update(id: string, updateDto: UpdatePurchaseRequestDto) {
    return this.databaseService.$transaction(async (prisma) => {
      const existingRequest = await prisma.purchaseRequest.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!existingRequest)
        throw new NotFoundException(`Request ${id} not found`);
      if (existingRequest.status !== PRStatus.WAITING) {
        throw new BadRequestException('Only WAITING requests can be modified');
      }

      if (updateDto.items) {
        const itemsWithDetails = await Promise.all(
          updateDto.items.map(async (item) => {
            const itemMaster = await prisma.itemMaster.findUnique({
              where: { id: item.itemId },
              include: { stock: true },
            });

            if (!itemMaster)
              throw new NotFoundException(`Item ${item.itemId} not found`);
            if (
              !itemMaster.stock ||
              itemMaster.stock.quantity < item.quantity
            ) {
              throw new BadRequestException(
                `Insufficient stock for item ${itemMaster.sku}. Available: ${itemMaster.stock?.quantity || 0}`,
              );
            }

            return {
              ...item,
              price: itemMaster.price,
              leftQuantity: item.quantity, // Initialize left quantity
            };
          }),
        );

        // Delete existing items
        await prisma.purchaseRequestItem.deleteMany({
          where: { purchaseRequestId: id },
        });

        // Calculate new totals
        const totalQty = itemsWithDetails.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        const totalPrice = itemsWithDetails.reduce(
          (sum, item) => sum + item.quantity * item.price,
          0,
        );

        return prisma.purchaseRequest.update({
          where: { id },
          data: {
            totalQty,
            leftQty: totalQty, // Reset left quantity
            totalPrice,
            items: {
              create: itemsWithDetails.map((item) => ({
                itemId: item.itemId,
                quantity: item.quantity,
                price: item.price,
                leftQuantity: item.quantity, // Add required field
              })),
            },
          },
          include: { items: true },
        });
      }

      return existingRequest;
    });
  }


  async remove(id: string) {
    return this.databaseService.purchaseRequest.delete({
      where: { id },
    });
  }
}
