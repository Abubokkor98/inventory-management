// src/goods-received/dto/update-goods-received.dto.ts
import { IsArray, ValidateNested, IsString, IsNotEmpty, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateGoodsReceivedDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateGoodsReceivedItemDto)
  items: UpdateGoodsReceivedItemDto[];
}

class UpdateGoodsReceivedItemDto {
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @IsInt()
  @Min(0)
  quantity: number;
}