import { IsArray, IsNotEmpty, IsUUID, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PurchaseOrderItemDto {
  @IsNotEmpty()
  @IsUUID()
  itemId: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}

export class CreatePurchaseOrderDto {
  @IsNotEmpty()
  @IsUUID()
  purchaseRequestId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items: PurchaseOrderItemDto[];
}