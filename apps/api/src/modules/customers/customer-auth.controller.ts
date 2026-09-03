import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerAuthService } from './customer-auth.service';
import { CustomerRegisterDto, CustomerLoginDto } from './dto/customer-auth.dto';
import { CustomerJwtAuthGuard } from './guards/customer-jwt.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { CurrentCustomer } from '../../common/decorators/current-customer.decorator';
import { BadRequestException } from '@nestjs/common';
import type { CustomerAuthUser, CustomerAuthResponse } from '@ecom/types';

/**
 * Storefront customer auth. Sits under `/storefront/auth` so the Angular
 * storefront (which already proxies `/api` → the engine) can consume it
 * alongside the rest of the public storefront API.
 *
 * `register`/`login` are public; `me` requires a customer JWT.
 */
@ApiTags('storefront/auth')
@Controller('storefront/auth')
export class CustomerAuthController {
  constructor(private readonly auth: CustomerAuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new storefront customer' })
  register(
    @CurrentStore() storeId: string,
    @Body() dto: CustomerRegisterDto,
    @Query('cartToken') cartToken?: string,
  ): Promise<CustomerAuthResponse> {
    this.requireStore(storeId);
    return this.auth.register(storeId, dto, cartToken);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Storefront customer login' })
  login(
    @CurrentStore() storeId: string,
    @Body() dto: CustomerLoginDto,
    @Query('cartToken') cartToken?: string,
  ): Promise<CustomerAuthResponse> {
    this.requireStore(storeId);
    return this.auth.login(storeId, dto, cartToken);
  }

  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Current authenticated customer' })
  me(@CurrentCustomer() customer: CustomerAuthUser): CustomerAuthUser {
    return customer;
  }

  private requireStore(storeId: string | null): void {
    if (!storeId) {
      throw new BadRequestException(
        "Missing store context. Send the 'x-store-id' header or a 'storeId' query parameter.",
      );
    }
  }
}
