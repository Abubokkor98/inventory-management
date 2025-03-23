import { PartialType } from '@nestjs/mapped-types';
import { CreateGoodsReceivedDto } from './create-goods-received.dto';

export class UpdateGoodsReceivedDto extends PartialType(CreateGoodsReceivedDto) {}
