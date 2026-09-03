import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { StoreContextService } from '../store-context.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api')) return next(req);

  const auth = inject(AuthService);
  const storeContext = inject(StoreContextService);
  const token = auth.token;
  const storeId = storeContext.currentStoreId();

  let headers = req.headers;
  if (token) headers = headers.set('Authorization', `Bearer ${token}`);
  if (storeId) headers = headers.set('x-store-id', storeId);

  return next(req.clone({ headers }));
};
