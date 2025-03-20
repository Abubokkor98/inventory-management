import { Module } from '@nestjs/common';
import { PurchaseRequestsService } from './purchase-requests.service';
import { PurchaseRequestsController } from './purchase-requests.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PurchaseRequestsController],
  providers: [PurchaseRequestsService],
})
export class PurchaseRequestsModule {}
