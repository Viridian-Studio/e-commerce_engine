import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AttributeValueDto {
  @ApiProperty()
  @IsString()
  value: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  label?: string;
}

export class CreateAttributeDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ type: [AttributeValueDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttributeValueDto)
  values: AttributeValueDto[];
}

export class UpdateAttributeDto extends PartialType(CreateAttributeDto) {}
