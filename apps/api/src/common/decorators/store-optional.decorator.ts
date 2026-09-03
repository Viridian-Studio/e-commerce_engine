import { SetMetadata } from '@nestjs/common';

export const STORE_OPTIONAL_KEY = 'storeOptional';

/** Marks a route that may be called without an `x-store-id` context. */
export const StoreOptional = () => SetMetadata(STORE_OPTIONAL_KEY, true);
