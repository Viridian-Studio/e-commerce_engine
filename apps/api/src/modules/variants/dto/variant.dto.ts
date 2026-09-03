import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ImageRef, VariantStatus } from '@ecom/types';
import { VariantAttributeSelectionDto } from '../../products/dto/product.dto';

class VariantImageDto implements ImageRef {
  @ApiProperty()
  @IsString()
  url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  alt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  position?: number;
}

export class CreateVariantDto {
  @ApiProperty()
  @IsString()
  sku: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  compareAtPrice?: number | null;

  @ApiProperty({ default: 'USD' })
  @IsString()
  currency: string;

  @ApiProperty({ default: 0 })
  @IsNumber()
  stock: number;

  @ApiPropertyOptional({ type: [VariantAttributeSelectionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantAttributeSelectionDto)
  attributes?: VariantAttributeSelectionDto[];

  @ApiPropertyOptional({ type: [VariantImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantImageDto)
  images?: VariantImageDto[];

  @ApiPropertyOptional({ enum: VariantStatus })
  @IsOptional()
  @IsEnum(VariantStatus)
  status?: VariantStatus;
}

export class UpdateVariantDto extends PartialType(CreateVariantDto) {}

export class AdjustStockDto {
  @ApiProperty({ description: 'Delta to add (negative to subtract). Sets absolute if absolute=true.' })
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional()
  @IsOptional()
  absolute?: boolean;
}
