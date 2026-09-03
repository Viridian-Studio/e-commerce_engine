import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomerAuthService } from './customer-auth.service';
import type { CustomerAuthUser } from '@ecom/types';

/**
 * Customer counterpart of the admin `JwtStrategy`. Registered under the
 * `customer-jwt` strategy name so the `CustomerJwtAuthGuard` can pick it up
 * without colliding with the admin `jwt` strategy.
 */
@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(Strategy, 'customer-jwt') {
  constructor(
    private readonly auth: CustomerAuthService,
    config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'change-me'),
    });
  }

  async validate(payload: CustomerAuthUser): Promise<CustomerAuthUser> {
    const customer = await this.auth.validateById(payload.id);
    if (!customer) throw new UnauthorizedException('Customer not found');
    return customer;
  }
}
