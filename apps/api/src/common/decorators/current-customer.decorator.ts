import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { CustomerAuthUser } from '@ecom/types';

/**
 * Extracts the authenticated customer (set by the `customer-jwt` strategy)
 * from the request. Use only on routes guarded by `CustomerJwtAuthGuard`.
 */
export const CurrentCustomer = createParamDecorator((_data: unknown, ctx: ExecutionContext): CustomerAuthUser => {
  return ctx.switchToHttp().getRequest().user as CustomerAuthUser;
});
