import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ItemsModule } from './items/items.module';

@Module({
  imports: [AuthModule, DatabaseModule, AuthModule, ItemsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
