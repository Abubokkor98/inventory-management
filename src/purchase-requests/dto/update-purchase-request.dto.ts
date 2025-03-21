// update-purchase-request.dto.ts
// import { IsEnum, IsOptional } from 'class-validator';
// import { PRStatus } from '@prisma/client';

// export class UpdatePurchaseRequestDto {
//   @IsOptional()
//   @IsEnum(PRStatus)
//   status?: PRStatus;
// }

// update-purchase-request.dto.ts
import { IsArray, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PurchaseRequestItemDto } from './create-purchase-request.dto';
import { PRStatus } from '@prisma/client';

export class UpdatePurchaseRequestDto {
  @IsOptional()
  @IsEnum(PRStatus)
  status?: PRStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseRequestItemDto)
  items?: PurchaseRequestItemDto[];
}
