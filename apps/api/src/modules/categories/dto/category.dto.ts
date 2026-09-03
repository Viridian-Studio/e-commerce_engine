import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { CategoryStatus } from '@ecom/types';

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentId?: string | null;

  @ApiPropertyOptional({ enum: CategoryStatus })
  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  seo?: { metaTitle?: string; metaDescription?: string; slug?: string; keywords?: string[] };
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

export class BulkCategoryStatusDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  ids: string[];

  @ApiProperty({ enum: CategoryStatus })
  @IsEnum(CategoryStatus)
  status: CategoryStatus;
}
