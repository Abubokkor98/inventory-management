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

          if (!itemMaster.stock || itemMaster.stock.quantity < item.quantity) {
            throw new BadRequestException(
              `Insufficient stock for item ${itemMaster.sku}. Available: ${itemMaster.stock?.quantity || 0}`,
            );
          }

          return {
            ...item,
            price: itemMaster.price,
          };
        }),
      );

      const totalQty = itemsWithDetails.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      const totalPrice = itemsWithDetails.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0,
      );

      const purchaseRequest = await prisma.purchaseRequest.create({
        data: {
          totalQty,
          totalPrice: totalPrice,
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

      //todo: i will need this when i create purchase order
      // await Promise.all(
      //   itemsWithDetails.map((item) =>
      //     prisma.stock.update({
      //       where: { itemId: item.itemId },
      //       data: { quantity: { decrement: item.quantity } },
      //     }),
      //   ),
      // );

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
  // async update(id: string, updateDto: UpdatePurchaseRequestDto) {
  //   await this.findOne(id);

  //   // Add custom validation here if needed
  //   if (updateDto.status) {
  //     // Example: Validate status transitions
  //     const current = await this.databaseService.purchaseRequest.findUnique({
  //       where: { id },
  //       select: { status: true },
  //     });

  //     if (
  //       current?.status === PRStatus.COMPLETE &&
  //       updateDto.status !== PRStatus.COMPLETE
  //     ) {
  //       throw new BadRequestException('Cannot modify completed requests');
  //     }
  //   }

  //   return this.databaseService.purchaseRequest.update({
  //     where: { id },
  //     data: updateDto,
  //     include: { items: true },
  //   });
  // }

  async update(id: string, updateDto: UpdatePurchaseRequestDto) {
    return this.databaseService.$transaction(async (prisma) => {
      // 1. Check existing request and status
      const existingRequest = await prisma.purchaseRequest.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!existingRequest)
        throw new NotFoundException(`Request ${id} not found`);
      if (existingRequest.status !== PRStatus.WAITING) {
        throw new BadRequestException('Only WAITING requests can be modified');
      }

      // 2. Process item updates if provided
      if (updateDto.items) {
        // Validate and prepare new items
        const itemsWithDetails = await this.validateAndPrepareItems(
          prisma,
          updateDto.items,
        );

        // Delete existing items and create new ones
        await prisma.purchaseRequestItem.deleteMany({
          where: { purchaseRequestId: id },
        });

        // Recalculate totals
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
            totalPrice,
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
      }

      // 3. If no items provided, return original request
      return existingRequest;
    });
  }

  private async validateAndPrepareItems(
    prisma: any,
    items: PurchaseRequestItemDto[],
  ) {
    return Promise.all(
      items.map(async (item) => {
        const itemMaster = await prisma.itemMaster.findUnique({
          where: { id: item.itemId },
          include: { stock: true },
        });

        if (!itemMaster) {
          throw new NotFoundException(`Item ${item.itemId} not found`);
        }

        if (!itemMaster.stock || itemMaster.stock.quantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${itemMaster.sku}. Available: ${itemMaster.stock?.quantity || 0}`,
          );
        }

        return {
          ...item,
          price: itemMaster.price,
        };
      }),
    );
  }

  async remove(id: string) {
    return this.databaseService.purchaseRequest.delete({
      where: { id },
    });
  }
}
