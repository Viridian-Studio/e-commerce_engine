import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { Brand } from '@ecom/types';
import { ResourceService } from './resource.service';

@Injectable({ providedIn: 'root' })
export class BrandService extends ResourceService<Brand> {
  constructor() {
    super('/api/admin/brands');
  }

  listAll(): Promise<Brand[]> {
    return firstValueFrom(this.http.get<Brand[]>(`${this.basePath}/list`));
  }
}
