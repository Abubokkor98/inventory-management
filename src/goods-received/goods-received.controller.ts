import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { GoodsReceivedService } from './goods-received.service';
import { CreateGoodsReceivedDto } from './dto/create-goods-received.dto';
import { UpdateGoodsReceivedDto } from './dto/update-goods-received.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('goods-received')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class GoodsReceivedController {
  constructor(private readonly goodsReceivedService: GoodsReceivedService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() createGoodsReceivedDto: CreateGoodsReceivedDto) {
    return this.goodsReceivedService.create(createGoodsReceivedDto);
  }

  @Get()
  @Roles('ADMIN')
  findAll() {
    return this.goodsReceivedService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.goodsReceivedService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body() updateGoodsReceivedDto: UpdateGoodsReceivedDto,
  ) {
    return this.goodsReceivedService.update(id, updateGoodsReceivedDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.goodsReceivedService.remove(id);
  }
}
