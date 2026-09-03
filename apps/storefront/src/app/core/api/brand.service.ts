import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { Brand } from '@ecom/types';
import { STOREFRONT_CONFIG } from '../config/storefront.config';

@Injectable({ providedIn: 'root' })
export class BrandService {
  private readonly http = inject(HttpClient);
  private readonly base = `${STOREFRONT_CONFIG.apiBase}/brands`;

  private cache: Promise<Brand[]> | null = null;

  list(): Promise<Brand[]> {
    if (!this.cache) {
      this.cache = firstValueFrom(this.http.get<Brand[]>(this.base));
    }
    return this.cache;
  }
}
