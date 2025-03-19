import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UpdateStockDto } from './dto/update-stock.dto';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('ADMIN')
  create(@Body() createItemDto: Prisma.ItemMasterCreateInput) {
    return this.itemsService.create(createItemDto);
  }

  // get all items
  @Get()
  findAll() {
    return this.itemsService.findAll();
  }

  // get a specific item
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemsService.findOne(id);
  }

  // update an item
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateItemDto: Prisma.ItemMasterUpdateInput,
  ) {
    return this.itemsService.update(id, updateItemDto);
  }

  // for only stock update
  @Patch(':id/stock')
  async updateStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStockDto: UpdateStockDto,
  ) {
    return this.itemsService.updateStock(id, updateStockDto.quantity);
  }

  // delete an item
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itemsService.remove(id);
  }
}
