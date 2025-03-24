// src/goods-received/dto/create-goods-received.dto.ts
import { IsString, IsArray, ValidateNested, IsNotEmpty, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

class GoodsReceivedItemDto {
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateGoodsReceivedDto {
  @IsString()
  @IsNotEmpty()
  purchaseOrderId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoodsReceivedItemDto)
  items: GoodsReceivedItemDto[];
}