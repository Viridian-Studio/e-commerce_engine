import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ShippingRateType } from '../schemas/shipping-zone.schema';

export class ShippingRateDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: ShippingRateType })
  @IsEnum(ShippingRateType)
  type: ShippingRateType;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minSubtotal?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxSubtotal?: number;
}

export class CreateShippingZoneDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  countries?: string[];

  @ApiPropertyOptional({ type: [ShippingRateDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShippingRateDto)
  rates?: ShippingRateDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class UpdateShippingZoneDto extends PartialType(CreateShippingZoneDto) {}
