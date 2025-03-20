import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Prisma, PRStatus } from '@prisma/client';
import { CreatePurchaseRequestDto } from './dto/create-purchase-request.dto';
import { UpdatePurchaseRequestDto } from './dto/update-purchase-request.dto';

@Injectable()
export class PurchaseRequestsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createPurchaseRequest(dto: CreatePurchaseRequestDto) {
    return this.databaseService.$transaction(async (prisma) => { // Fixed transaction access
      const itemsWithDetails = await Promise.all(
        dto.items.map(async (item) => {
          const itemMaster = await prisma.itemMaster.findUnique({
            where: { id: item.itemId },
            include: { stock: true },
          });

          if (!itemMaster) {
            throw new NotFoundException(`Item ${item.itemId} not found`);
          }

          if (!itemMaster.stock || itemMaster.stock.quantity < item.quantity) {
            throw new BadRequestException(
              `Insufficient stock for item ${itemMaster.sku}. Available: ${itemMaster.stock?.quantity || 0}`
            );
          }

          return {
            ...item,
            price: itemMaster.price,
          };
        })
      );

      const totalQty = itemsWithDetails.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = itemsWithDetails.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );

      const purchaseRequest = await prisma.purchaseRequest.create({
        data: {
          totalQty,
          price: totalPrice,
          status: PRStatus.WAITING,
          items: {
            create: itemsWithDetails.map((item) => ({
              itemId: item.itemId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { items: true },
      });

      await Promise.all(
        itemsWithDetails.map((item) =>
          prisma.stock.update({
            where: { itemId: item.itemId },
            data: { quantity: { decrement: item.quantity } },
          })
        )
      );

      return purchaseRequest;
    });
  }

  async findAll() {
    return this.databaseService.purchaseRequest.findMany({
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const request = await this.databaseService.purchaseRequest.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException(`Purchase request with ID ${id} not found`);
    }
    return request;
  }

  async update(id: string, updateDto: UpdatePurchaseRequestDto) {
    await this.findOne(id); // Check if exists
    
    // Add custom validation here if needed
    if (updateDto.status) {
      // Example: Validate status transitions
      const current = await this.databaseService.purchaseRequest.findUnique({
        where: { id },
        select: { status: true }
      });

      if (current?.status === PRStatus.COMPLETE && updateDto.status !== PRStatus.COMPLETE) {
        throw new BadRequestException('Cannot modify completed requests');
      }
    }

    return this.databaseService.purchaseRequest.update({
      where: { id },
      data: updateDto,
      include: { items: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists
    
    return this.databaseService.purchaseRequest.delete({
      where: { id },
    });
  }
}