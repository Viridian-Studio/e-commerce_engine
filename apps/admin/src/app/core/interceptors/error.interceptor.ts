import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth.service';
import { NotificationService } from '../notification.service';
import { extractErrorMessage } from '../http-error';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const notifications = inject(NotificationService);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401 && auth.isAuthenticated()) {
          auth.logout();
          void router.navigateByUrl('/login');
        } else if (err.status !== 401) {
          notifications.error(extractErrorMessage(err));
        }
      }
      return throwError(() => err);
    }),
  );
};
