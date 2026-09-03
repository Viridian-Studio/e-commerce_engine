import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extracts the current store id from the request.
 * Resolved from (in order): query param `storeId`, header `x-store-id`.
 */
export const CurrentStore = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return req.storeId ?? req.query?.storeId ?? req.headers?.['x-store-id'] ?? null;
});
