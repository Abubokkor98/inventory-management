import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ItemsModule } from './items/items.module';
import { PurchaseRequestsModule } from './purchase-requests/purchase-requests.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { GoodsReceivedModule } from './goods-received/goods-received.module';

@Module({
  imports: [AuthModule, DatabaseModule, AuthModule, ItemsModule, PurchaseRequestsModule, PurchaseOrdersModule, GoodsReceivedModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
