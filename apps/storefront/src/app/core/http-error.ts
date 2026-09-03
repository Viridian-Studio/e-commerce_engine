import { HttpErrorResponse } from '@angular/common/http';

/** Extracts a human-readable message from a Nest-style error response body. */
export function extractErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as { message?: string | string[] } | undefined;
    if (body?.message) {
      return Array.isArray(body.message) ? body.message.join(', ') : body.message;
    }
    return err.message || fallback;
  }
  return fallback;
}
