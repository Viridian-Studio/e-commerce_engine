import { Injectable } from '@angular/core';
import type { Customer } from '@ecom/types';
import { ResourceService } from './resource.service';

@Injectable({ providedIn: 'root' })
export class CustomerService extends ResourceService<Customer> {
  constructor() {
    super('/api/admin/customers');
  }
}
