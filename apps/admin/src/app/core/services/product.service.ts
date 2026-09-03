import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { Product, ProductStatus } from '@ecom/types';
import { ResourceService } from './resource.service';

@Injectable({ providedIn: 'root' })
export class ProductService extends ResourceService<Product> {
  constructor() {
    super('/api/admin/products');
  }

  bulkStatus(ids: string[], status: ProductStatus): Promise<{ modified: number }> {
    return firstValueFrom(
      this.http.patch<{ modified: number }>(`${this.basePath}/bulk-status`, { ids, status }),
    );
  }
}
