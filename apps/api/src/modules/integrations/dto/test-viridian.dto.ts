import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TestViridianDto {
  @ApiProperty({ description: 'Viridian Warehouse API key to test' })
  @IsString()
  apiKey: string;
}
