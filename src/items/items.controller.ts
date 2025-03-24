import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { Prisma } from '@prisma/client';
import { UpdateStockDto } from './dto/update-stock.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('items')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() createItemDto: Prisma.ItemMasterCreateInput) {
    return this.itemsService.create(createItemDto);
  }

  @Get()
  @Roles('ADMIN')
  findAll() {
    return this.itemsService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.itemsService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body() updateItemDto: Prisma.ItemMasterUpdateInput,
  ) {
    return this.itemsService.update(id, updateItemDto);
  }

  // for only stock update
  @Patch(':id/stock')
  @Roles('MANAGER')
  async updateStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStockDto: UpdateStockDto,
  ) {
    return this.itemsService.updateStock(id, updateStockDto.quantity);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.itemsService.remove(id);
  }
}
