import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GoodsReceivedService } from './goods-received.service';
import { CreateGoodsReceivedDto } from './dto/create-goods-received.dto';
import { UpdateGoodsReceivedDto } from './dto/update-goods-received.dto';

@Controller('goods-received')
export class GoodsReceivedController {
  constructor(private readonly goodsReceivedService: GoodsReceivedService) {}

  @Post()
  create(@Body() createGoodsReceivedDto: CreateGoodsReceivedDto) {
    return this.goodsReceivedService.create(createGoodsReceivedDto);
  }

  @Get()
  findAll() {
    return this.goodsReceivedService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.goodsReceivedService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGoodsReceivedDto: UpdateGoodsReceivedDto) {
    return this.goodsReceivedService.update(+id, updateGoodsReceivedDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.goodsReceivedService.remove(id);
  }
}
