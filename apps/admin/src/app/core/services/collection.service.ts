import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { Collection } from '@ecom/types';
import { ResourceService } from './resource.service';

@Injectable({ providedIn: 'root' })
export class CollectionService extends ResourceService<Collection> {
  constructor() {
    super('/api/admin/collections');
  }

  listAll(): Promise<Collection[]> {
    return firstValueFrom(this.http.get<Collection[]>(`${this.basePath}/list`));
  }
}
