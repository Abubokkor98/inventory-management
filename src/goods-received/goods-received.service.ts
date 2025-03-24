import { Stock } from './../../node_modules/.prisma/client/index.d';
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateGoodsReceivedDto } from './dto/create-goods-received.dto';
import { UpdateGoodsReceivedDto } from './dto/update-goods-received.dto';
import { DatabaseService } from 'src/database/database.service';
import { POStatus, PurchaseOrderItem } from '@prisma/client';

@Injectable()
export class GoodsReceivedService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createDto: CreateGoodsReceivedDto) {
    return this.databaseService.$transaction(async (prisma) => {
      const { purchaseOrderId, items } = createDto;

      // Step 1: Find the purchase order and its items
      const purchaseOrder = await prisma.purchaseOrder.findUnique({
        where: { id: purchaseOrderId },
        include: { items: true },
      });

      // If purchase order doesn't exist
      if (!purchaseOrder) {
        throw new NotFoundException('Purchase order not found');
      }

      // Check if order is already completed/closed
      if (
        purchaseOrder.status === 'COMPLETE' ||
        purchaseOrder.status === 'OVER'
      ) {
        throw new ConflictException('This purchase order is already closed');
      }

      // Step 2: Process each item in the request
      let hasOverReceived = false;

      // Update each item one by one
      for (const item of items) {
        // Find the matching item in the purchase order
        const orderItem = purchaseOrder.items.find(
          (i) => i.itemId === item.itemId,
        );

        if (!orderItem) {
          throw new NotFoundException(`Item ${item.itemId} not found in purchase order`);
        }

        // Check if received more than remaining quantity
        if (item.quantity > orderItem.remainingQty) {
          hasOverReceived = true;
        }

        // Update the remaining quantity (never go below 0)
        await prisma.purchaseOrderItem.update({
          where: { id: orderItem.id },
          data: {
            remainingQty: Math.max(orderItem.remainingQty - item.quantity, 0),
          },
        });
      }

      // Step 3: Get fresh data after updates for further processing
      const updatedOrder = await prisma.purchaseOrder.findUnique({
        where: { id: purchaseOrderId },
        include: { items: true },
      });

      // Ensure updatedOrder exists before proceeding
      if (!updatedOrder) {
        throw new NotFoundException('Updated purchase order not found');
      }

      // Step 4: Calculate new status
      let newStatus: POStatus = 'PARTIAL';
      const totalRemaining = updatedOrder.items.reduce(
        (sum, item) => sum + item.remainingQty,
        0,
      );

      if (hasOverReceived) {
        newStatus = 'OVER';
      } else if (totalRemaining === 0) {
        newStatus = 'COMPLETE';
      }

      // Step 5: Update the purchase order status and remaining quantity
      await prisma.purchaseOrder.update({
        where: { id: purchaseOrderId },
        data: {
          status: newStatus,
          remainingQty: totalRemaining,
        },
      });

      // Step 6:Finally, create the goods received record
      const goodsReceived = await prisma.goodsReceived.create({
        data: {
          purchaseOrderId,
          totalQty: items.reduce((sum, item) => sum + item.quantity, 0),
          items: {
            create: items.map((item) => ({
              itemId: item.itemId,
              quantity: item.quantity,
            })),
          },
        },
      });

      // Step 7: Update itemMaster stock levels
      for (const item of items) {
        await prisma.stock.update({
          where: { itemId: item.itemId },
          data: { quantity: { increment: item.quantity } },
        });
      }

      return goodsReceived;
    });
  }

  async findAll() {
    return this.databaseService.goodsReceived.findMany({
      include: {
        items: true,
      },
    });
  }

  async findOne(id: string) {
    const request = await this.databaseService.goodsReceived.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!request) {
      throw new NotFoundException(`Goods received ${id} not found`);
    }
    return request;
  }

  update(id: number, updateGoodsReceivedDto: UpdateGoodsReceivedDto) {
    return `This action updates a #${id} goodsReceived`;
  }

  async remove(id: string) {
    return this.databaseService.goodsReceived.delete({
      where: { id },
    });
  }
}
