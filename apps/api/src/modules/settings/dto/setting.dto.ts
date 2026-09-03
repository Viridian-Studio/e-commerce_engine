import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpsertSettingDto {
  @ApiProperty()
  @IsString()
  key: string;

  @ApiProperty({ type: Object })
  value: unknown;
}
