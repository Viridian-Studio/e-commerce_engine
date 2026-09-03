import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../api/auth.service';

/**
 * Attaches the customer JWT as a Bearer token to storefront API requests.
 * The engine's `@Public()` storefront routes ignore the header, while the
 * customer-guarded ones (`/storefront/auth/me`) require it.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/storefront')) return next(req);

  const token = inject(AuthService).getToken();
  if (!token) return next(req);

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
