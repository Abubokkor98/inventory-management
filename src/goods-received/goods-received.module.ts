import { Module } from '@nestjs/common';
import { GoodsReceivedService } from './goods-received.service';
import { GoodsReceivedController } from './goods-received.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [GoodsReceivedController],
  providers: [GoodsReceivedService],
})
export class GoodsReceivedModule {}
