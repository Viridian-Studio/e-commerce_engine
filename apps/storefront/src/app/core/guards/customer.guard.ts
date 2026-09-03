import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../api/auth.service';

/**
 * Protects customer-only routes (e.g. /account). Unauthenticated visitors are
 * redirected to /login with a `returnUrl` so a successful login can bring them
 * back. A saved-but-unvalidated token is treated as authenticated optimistically
 * — the engine will reject it on the first protected call if it's stale.
 */
export const customerGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  const returnUrl = state.url;
  return router.createUrlTree(['/login'], { queryParams: { returnUrl } });
};
