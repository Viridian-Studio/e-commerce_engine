import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import type { CustomerLoginRequest, CustomerRegisterRequest } from '@ecom/types';

export class CustomerRegisterDto implements CustomerRegisterRequest {
  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Jane123!' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Jane' })
  @IsString()
  @MinLength(1)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(1)
  lastName: string;

  @ApiPropertyOptional({ example: '+36 30 123 4567' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class CustomerLoginDto implements CustomerLoginRequest {
  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Jane123!' })
  @IsString()
  @MinLength(6)
  password: string;
}
