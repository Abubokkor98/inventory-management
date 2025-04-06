import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ItemsService {
  constructor(private readonly databaseService: DatabaseService) {}

  // async create(createItemDto: Prisma.ItemMasterCreateInput) {
  //   const item = await this.databaseService.itemMaster.create({
  //     data: createItemDto,
  //   });
  //   await this.databaseService.stock.create({
  //     data: { itemId: item.id, quantity: 0 },
  //   });
  //   return item;
  // }

  async create(createItemDto: Prisma.ItemMasterCreateInput) {
    const item = await this.databaseService.itemMaster.create({
      data: {
        ...createItemDto,
        stock: {
          create: { quantity: 0 },
        },
      },
      include: { stock: true },
    });

    return item;
  }

  // find all items
  async findAll() {
    return this.databaseService.itemMaster.findMany({
      include: {
        stock: true,
      },
    });
  }

  // find a specific item
  async findOne(id: string) {
    return this.databaseService.itemMaster.findUnique({
      where: {
        id,
      },
    });
  }

  // facing issue bcz of stock //todo: currently solved, but have change logic later

  async update(id: string, updateItemDto: Prisma.ItemMasterUpdateInput) {
    return this.databaseService.itemMaster.update({
      where: { id },
      data: {
        ...updateItemDto,
        // Handle nested stock update through the relation
        stock: updateItemDto.stock
          ? {
              update: updateItemDto.stock,
            }
          : undefined,
      },
      include: { stock: true },
    });
  }

  // update specific item stock
  async updateStock(id: string, quantity: number) {
    const item = await this.databaseService.itemMaster.findUnique({
      where: { id },
      include: { stock: true },
    });

    if (!item) throw new NotFoundException('Item not found');

    return this.databaseService.stock.update({
      where: { itemId: id },
      data: { quantity },
    });
  }

  // Stock will be automatically deleted due to onDelete: Cascade
  async remove(id: string) {
    return this.databaseService.itemMaster.delete({
      where: { id },
    });
  }
}
