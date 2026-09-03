import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { Paginated, Product } from '@ecom/types';
import { STOREFRONT_CONFIG } from '../config/storefront.config';

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  categoryId?: string;
  collectionId?: string;
  brandId?: string;
  ids?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly base = `${STOREFRONT_CONFIG.apiBase}/products`;

  list(params: ProductListParams = {}): Promise<Paginated<Product>> {
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return firstValueFrom(this.http.get<Paginated<Product>>(this.base, { params: httpParams }));
  }

  getBySlug(slug: string): Promise<Product> {
    return firstValueFrom(this.http.get<Product>(`${this.base}/${slug}`));
  }

  /** Other active products sharing a category, for the "You may also like" rail. */
  async related(product: Product, limit = 4): Promise<Product[]> {
    const categoryId = product.categoryIds[0];
    if (!categoryId) return [];
    const { data } = await this.list({ categoryId, limit: limit + 1 });
    return data.filter((p) => p._id !== product._id).slice(0, limit);
  }
}
