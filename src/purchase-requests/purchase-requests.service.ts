import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PurchaseRequestsService {
  constructor(private readonly databaseService: DatabaseService) {}
  async create(createPurchaseRequestDto: Prisma.PurchaseRequestCreateInput) {
    return this.databaseService.purchaseRequest.create({
      data: createPurchaseRequestDto,
    });
  }

  async findAll() {
    return this.databaseService.purchaseRequest.findMany();
  }

  async findOne(id: string) {
    return this.databaseService.purchaseRequest.findUnique({
      where: {
        id,
      },
    });
  }

  async update(
    id: string,
    updatePurchaseRequestDto: Prisma.PurchaseRequestUpdateInput,
  ) {
    return `This action updates a #${id} purchaseRequest`;
  }

  async remove(id: string) {
    return this.databaseService.purchaseRequest.delete({
      where: {
        id,
      },
    });
  }
}
