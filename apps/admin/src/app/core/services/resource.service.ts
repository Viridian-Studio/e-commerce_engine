import { inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { Paginated } from '@ecom/types';

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  status?: string;
  [key: string]: string | number | undefined;
}

/**
 * Thin REST client shared by every admin resource (products, orders, ...).
 * Concrete services extend this for the common list/get/create/update/remove
 * shape and add resource-specific methods on top.
 */
export abstract class ResourceService<T> {
  protected readonly http = inject(HttpClient);

  protected constructor(protected readonly basePath: string) {}

  list(params: ListParams = {}): Promise<Paginated<T>> {
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return firstValueFrom(this.http.get<Paginated<T>>(this.basePath, { params: httpParams }));
  }

  get(id: string): Promise<T> {
    return firstValueFrom(this.http.get<T>(`${this.basePath}/${id}`));
  }

  create(dto: Record<string, unknown>): Promise<T> {
    return firstValueFrom(this.http.post<T>(this.basePath, dto));
  }

  update(id: string, dto: Record<string, unknown>): Promise<T> {
    return firstValueFrom(this.http.patch<T>(`${this.basePath}/${id}`, dto));
  }

  remove(id: string): Promise<{ id: string }> {
    return firstValueFrom(this.http.delete<{ id: string }>(`${this.basePath}/${id}`));
  }
}
