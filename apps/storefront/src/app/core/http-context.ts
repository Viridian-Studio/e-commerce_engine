import { HttpContextToken } from '@angular/common/http';

/** Set on a request to suppress the global error toast — used for requests
 * where "not found" / "invalid" is an expected, inline-handled outcome
 * (e.g. live discount-code validation while the customer is still typing). */
export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);
