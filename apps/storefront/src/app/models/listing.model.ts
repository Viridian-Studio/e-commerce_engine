/** View-model types for the product listing page (category / collection / brand). Not part of @ecom/types — presentational only. */

export type ListingMode = 'category' | 'collection' | 'brand';

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

export interface SiblingLink {
  slug: string;
  name: string;
  count: number;
  active: boolean;
}

export type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'newest';

export interface ListingFilterState {
  sizes: string[];
  colors: string[];
  maxPrice: number | null;
  sort: SortKey;
  page: number;
}
