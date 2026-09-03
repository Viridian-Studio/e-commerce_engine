import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';

/**
 * Protects customer-facing storefront routes using the `customer-jwt` strategy.
 * Routes/controllers marked `@Public()` bypass authentication — the storefront
 * controller is already `@Public()` at the class level, so this guard is only
 * applied to the handful of methods that require a logged-in customer.
 */
@Injectable()
export class CustomerJwtAuthGuard extends AuthGuard('customer-jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  override canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
