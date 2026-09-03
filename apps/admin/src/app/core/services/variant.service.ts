import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { ProductVariant } from '@ecom/types';

@Injectable({ providedIn: 'root' })
export class VariantService {
  private readonly http = inject(HttpClient);
  private readonly basePath = '/api/admin/variants';

  listByProduct(productId: string): Promise<ProductVariant[]> {
    return firstValueFrom(this.http.get<ProductVariant[]>(`${this.basePath}/product/${productId}`));
  }

  create(productId: string, dto: Record<string, unknown>): Promise<ProductVariant> {
    return firstValueFrom(
      this.http.post<ProductVariant>(`${this.basePath}/product/${productId}`, dto),
    );
  }

  update(id: string, dto: Record<string, unknown>): Promise<ProductVariant> {
    return firstValueFrom(this.http.patch<ProductVariant>(`${this.basePath}/${id}`, dto));
  }

  adjustStock(id: string, quantity: number, absolute = false): Promise<ProductVariant> {
    return firstValueFrom(
      this.http.patch<ProductVariant>(`${this.basePath}/${id}/stock`, { quantity, absolute }),
    );
  }

  remove(id: string): Promise<{ id: string }> {
    return firstValueFrom(this.http.delete<{ id: string }>(`${this.basePath}/${id}`));
  }
}
