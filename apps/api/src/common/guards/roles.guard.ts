import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminRole } from '@ecom/types';
import type { AuthUser } from '@ecom/types';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Minimal RBAC: a handler declares the roles allowed to reach it with
 * `@Roles(AdminRole.MANAGER)`. SUPER_ADMIN always passes. Handlers without a
 * `@Roles()` decorator are open to any authenticated admin user.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<AdminRole[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const user = context.switchToHttp().getRequest<{ user?: AuthUser }>().user;
    if (!user) throw new ForbiddenException('Not authenticated');
    if (user.role === AdminRole.SUPER_ADMIN) return true;
    if (!required.includes(user.role)) {
      throw new ForbiddenException(`Requires one of: ${required.join(', ')}`);
    }
    return true;
  }
}
