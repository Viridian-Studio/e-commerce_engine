import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { DiscountStatus, DiscountType } from '../schemas/discount.schema';

export class CreateDiscountDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: DiscountType })
  @IsEnum(DiscountType)
  type: DiscountType;

  @ApiProperty()
  @IsNumber()
  value: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minSubtotal?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxDiscount?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  usageLimit?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startsAt?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endsAt?: string | null;

  @ApiPropertyOptional({ enum: DiscountStatus })
  @IsOptional()
  @IsEnum(DiscountStatus)
  status?: DiscountStatus;
}

export class UpdateDiscountDto extends PartialType(CreateDiscountDto) {}
