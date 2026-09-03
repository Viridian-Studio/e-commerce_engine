import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import type { LoginRequest } from '@ecom/types';

export class LoginDto implements LoginRequest {
  @ApiProperty({ example: 'admin@ecommerce.engine' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin123!' })
  @IsString()
  @MinLength(6)
  password: string;
}
