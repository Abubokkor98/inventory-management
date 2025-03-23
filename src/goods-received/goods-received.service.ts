import { Injectable } from '@nestjs/common';
import { CreateGoodsReceivedDto } from './dto/create-goods-received.dto';
import { UpdateGoodsReceivedDto } from './dto/update-goods-received.dto';

@Injectable()
export class GoodsReceivedService {
  create(createGoodsReceivedDto: CreateGoodsReceivedDto) {
    return 'This action adds a new goodsReceived';
  }

  findAll() {
    return `This action returns all goodsReceived`;
  }

  findOne(id: number) {
    return `This action returns a #${id} goodsReceived`;
  }

  update(id: number, updateGoodsReceivedDto: UpdateGoodsReceivedDto) {
    return `This action updates a #${id} goodsReceived`;
  }

  remove(id: number) {
    return `This action removes a #${id} goodsReceived`;
  }
}
