import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PurchaseRequestsService } from './purchase-requests.service';
import { Prisma } from '@prisma/client';

@Controller('purchase-requests')
export class PurchaseRequestsController {
  constructor(
    private readonly purchaseRequestsService: PurchaseRequestsService,
  ) {}

  @Post()
  create(@Body() createPurchaseRequestDto: Prisma.PurchaseRequestCreateInput) {
    return this.purchaseRequestsService.create(createPurchaseRequestDto);
  }

  @Get()
  findAll() {
    return this.purchaseRequestsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchaseRequestsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePurchaseRequestDto: Prisma.PurchaseRequestUpdateInput,
  ) {
    return this.purchaseRequestsService.update(id, updatePurchaseRequestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.purchaseRequestsService.remove(id);
  }
}
