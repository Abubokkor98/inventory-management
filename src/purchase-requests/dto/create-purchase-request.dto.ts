import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PurchaseRequestItemDto {
  @IsNotEmpty()
  itemId: string;

  @IsNotEmpty()
  quantity: number;
}

export class CreatePurchaseRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseRequestItemDto)
  items: PurchaseRequestItemDto[];
}