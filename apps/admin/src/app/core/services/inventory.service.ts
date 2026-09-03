import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { Paginated, ProductVariant } from '@ecom/types';
import type { ListParams } from './resource.service';

export interface InventorySummary {
  totalSkus: number;
  totalStock: number;
  lowStock: number;
  outOfStock: number;
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly http = inject(HttpClient);
  private readonly basePath = '/api/admin/inventory';

  list(params: ListParams = {}): Promise<Paginated<ProductVariant & { productName?: string }>> {
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return firstValueFrom(
      this.http.get<Paginated<ProductVariant & { productName?: string }>>(this.basePath, {
        params: httpParams,
      }),
    );
  }

  summary(): Promise<InventorySummary> {
    return firstValueFrom(this.http.get<InventorySummary>(`${this.basePath}/summary`));
  }

  lowStock(): Promise<ProductVariant[]> {
    return firstValueFrom(this.http.get<ProductVariant[]>(`${this.basePath}/low-stock`));
  }
}
