import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDefined } from 'class-validator';

export class UpsertSettingDto {
  @ApiProperty()
  @IsString()
  key: string;

  @ApiProperty({ type: Object })
  @IsDefined()
  value: unknown;
}
