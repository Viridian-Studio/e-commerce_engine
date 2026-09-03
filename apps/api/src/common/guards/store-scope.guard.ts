import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminRole } from '@ecom/types';
import type { AuthUser } from '@ecom/types';
import { STORE_OPTIONAL_KEY } from '../decorators/store-optional.decorator';

export const STORE_HEADER = 'x-store-id';

/**
 * Multi-store enforcement.
 *
 * Every store-scoped admin request must name the store it operates on, via the
 * `x-store-id` header (preferred) or a `storeId` query parameter. The resolved
 * id is attached to the request so `@CurrentStore()` can read it, and the user's
 * `storeIds` allow-list is checked. SUPER_ADMIN may act on any store, and a user
 * with an empty allow-list is treated as unrestricted (single-tenant setups).
 */
@Injectable()
export class StoreScopeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const optional = this.reflector.getAllAndOverride<boolean>(STORE_OPTIONAL_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const req = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      query: Record<string, unknown>;
      user?: AuthUser;
      storeId?: string;
    }>();

    const storeId =
      (req.headers?.[STORE_HEADER] as string | undefined) ??
      (typeof req.query?.['storeId'] === 'string' ? (req.query['storeId'] as string) : undefined);

    if (!storeId) {
      if (optional) return true;
      throw new BadRequestException(
        `Missing store context. Send the '${STORE_HEADER}' header or a 'storeId' query parameter.`,
      );
    }

    const user = req.user;
    if (user && user.role !== AdminRole.SUPER_ADMIN) {
      const allowed = user.storeIds ?? [];
      if (allowed.length > 0 && !allowed.includes(storeId)) {
        throw new ForbiddenException('You do not have access to this store');
      }
    }

    req.storeId = storeId;
    return true;
  }
}
