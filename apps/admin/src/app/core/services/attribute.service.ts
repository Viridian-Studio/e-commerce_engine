import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { Attribute } from '@ecom/types';
import { ResourceService } from './resource.service';

@Injectable({ providedIn: 'root' })
export class AttributeService extends ResourceService<Attribute> {
  constructor() {
    super('/api/admin/attributes');
  }

  listAll(): Promise<Attribute[]> {
    return firstValueFrom(this.http.get<Attribute[]>(`${this.basePath}/list`));
  }
}
