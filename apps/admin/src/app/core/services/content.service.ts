import { Injectable } from '@angular/core';
import type { Content } from '@ecom/types';
import { ResourceService } from './resource.service';

@Injectable({ providedIn: 'root' })
export class ContentService extends ResourceService<Content> {
  constructor() {
    super('/api/admin/content');
  }
}
