import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { StoreStatus } from '@ecom/types';

export class CreateStoreDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  slug: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiProperty({ default: 'USD' })
  @IsString()
  currency: string;

  @ApiProperty({ default: 'en-US' })
  @IsString()
  locale: string;

  @ApiProperty({ default: 'UTC' })
  @IsString()
  timezone: string;

  @ApiPropertyOptional({ enum: StoreStatus })
  @IsOptional()
  @IsEnum(StoreStatus)
  status?: StoreStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactEmail?: string;
}

export class UpdateStoreDto extends PartialType(CreateStoreDto) {}
