/**
 * Per-deployment storefront config. This is the "environment" the storefront
 * needs — kept as a single injectable object (matching apps/admin, which has
 * no environment.ts files either) rather than build-time environment files,
 * so the same build can be repointed at a different store slug at runtime.
 */
export interface StorefrontConfig {
  /** Slug of the store this storefront instance renders (GET /api/storefront/store?slug=). */
  storeSlug: string;
  /** Base path for all storefront API calls; proxied to the engine in dev. */
  apiBase: string;
}

export const STOREFRONT_CONFIG: StorefrontConfig = {
  storeSlug: 'ultras-shop',
  apiBase: '/api/storefront',
};
