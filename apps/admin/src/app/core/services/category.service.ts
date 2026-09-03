import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { Category, CategoryStatus } from '@ecom/types';
import { ResourceService } from './resource.service';

@Injectable({ providedIn: 'root' })
export class CategoryService extends ResourceService<Category> {
  constructor() {
    super('/api/admin/categories');
  }

  tree(): Promise<Category[]> {
    return firstValueFrom(this.http.get<Category[]>(`${this.basePath}/tree`));
  }

  bulkStatus(ids: string[], status: CategoryStatus): Promise<{ modified: number }> {
    return firstValueFrom(
      this.http.patch<{ modified: number }>(`${this.basePath}/bulk-status`, { ids, status }),
    );
  }
}
