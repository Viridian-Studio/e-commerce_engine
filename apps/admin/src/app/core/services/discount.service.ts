import { Injectable } from '@angular/core';
import type { Discount } from '@ecom/types';
import { ResourceService } from './resource.service';

@Injectable({ providedIn: 'root' })
export class DiscountService extends ResourceService<Discount> {
  constructor() {
    super('/api/admin/discounts');
  }
}
