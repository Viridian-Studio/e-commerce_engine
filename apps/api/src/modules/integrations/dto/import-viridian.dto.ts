import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class ImportViridianDto {
  @ApiProperty({ description: 'Viridian Warehouse API key' })
  @IsString()
  apiKey: string;

  @ApiProperty({ type: [String], description: 'Warehouse inventory item ids to import as draft products' })
  @IsArray()
  @IsString({ each: true })
  itemIds: string[];
}
