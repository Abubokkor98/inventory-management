import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PurchaseRequestItemDto } from './create-purchase-request.dto';

export class UpdatePurchaseRequestDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseRequestItemDto)
  items?: PurchaseRequestItemDto[];
}
