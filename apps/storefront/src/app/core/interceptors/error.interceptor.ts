import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../toast.service';
import { extractErrorMessage } from '../http-error';
import { SKIP_ERROR_TOAST } from '../http-context';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status !== 0 && !req.context.get(SKIP_ERROR_TOAST)) {
        toast.error(extractErrorMessage(err));
      }
      return throwError(() => err);
    }),
  );
};
