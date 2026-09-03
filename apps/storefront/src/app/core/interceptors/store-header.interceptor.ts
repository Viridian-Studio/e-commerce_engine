import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StoreService } from '../api/store.service';

export const storeHeaderInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api')) return next(req);

  const storeId = inject(StoreService).storeId();
  if (!storeId) return next(req);

  return next(req.clone({ headers: req.headers.set('x-store-id', storeId) }));
};
