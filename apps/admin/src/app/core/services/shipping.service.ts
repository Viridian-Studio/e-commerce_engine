import { Injectable } from '@angular/core';
import type { ShippingZone } from '@ecom/types';
import { ResourceService } from './resource.service';

@Injectable({ providedIn: 'root' })
export class ShippingService extends ResourceService<ShippingZone> {
  constructor() {
    super('/api/admin/shipping');
  }
}
