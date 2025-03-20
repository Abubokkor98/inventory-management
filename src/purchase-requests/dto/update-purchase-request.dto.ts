// update-purchase-request.dto.ts
import { IsEnum, IsOptional } from 'class-validator';
import { PRStatus } from '@prisma/client';

export class UpdatePurchaseRequestDto {
  @IsOptional()
  @IsEnum(PRStatus)
  status?: PRStatus;
}