import { Module } from '@nestjs/common';
import { GoodsReceivedService } from './goods-received.service';
import { GoodsReceivedController } from './goods-received.controller';

@Module({
  controllers: [GoodsReceivedController],
  providers: [GoodsReceivedService],
})
export class GoodsReceivedModule {}
