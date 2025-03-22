import { Injectable } from '@nestjs/common';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class PurchaseOrdersService {
  constructor(private readonly databaseService: DatabaseService) {}
  async createPurchaseOrder(dto: CreatePurchaseOrderDto) {
    return this.databaseService.$transaction(async (prisma) => {
      // 1. Validate Purchase Request
      const purchaseRequest = await prisma.purchaseRequest.findUnique({
        where: { id: dto.purchaseRequestId },
        include: { items: true }
      });
  
      if (!purchaseRequest) {
        throw new Error('Purchase request not found');
      }
  
      if (purchaseRequest.status !== 'WAITING') {
        throw new Error('Purchase request is not in a valid state for ordering');
      }
  
      // 2. Prepare PO items from PR items
      const poItems = purchaseRequest.items.map(prItem => ({
        itemId: prItem.itemId,
        quantity: prItem.quantity,
        price: prItem.price  // Or get current price from ItemMaster
      }));
  
      // 3. Calculate totals
      const totalQty = poItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = poItems.reduce(
        (sum, item) => sum + (item.quantity * item.price),
        0
      );
  
      // 4. Create Purchase Order
      const purchaseOrder = await prisma.purchaseOrder.create({
        data: {
          purchaseRequestId: dto.purchaseRequestId,
          totalQty,
          remainingQty: totalQty,
          totalPrice,
          status: 'WAITING',
          items: {
            create: poItems.map(item => ({
              quantity: item.quantity,
              price: item.price,
              remainingQty: item.quantity,
              itemId: item.itemId,
            })),
          },
        },
        include: { items: true },
      });
  
      // 5. Update Purchase Request status
      await prisma.purchaseRequest.update({
        where: { id: dto.purchaseRequestId },
        data: { status: 'PARTIAL' }
      });
  
      return purchaseOrder;
    });
  }

  findAll() {
    return this.databaseService.purchaseOrder.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} purchaseOrder`;
  }

  update(id: number, updatePurchaseOrderDto: UpdatePurchaseOrderDto) {
    return `This action updates a #${id} purchaseOrder`;
  }

  remove(id: number) {
    return `This action removes a #${id} purchaseOrder`;
  }
}
