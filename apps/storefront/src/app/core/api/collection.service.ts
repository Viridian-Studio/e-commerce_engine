import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { Collection } from '@ecom/types';
import { STOREFRONT_CONFIG } from '../config/storefront.config';

@Injectable({ providedIn: 'root' })
export class CollectionService {
  private readonly http = inject(HttpClient);
  private readonly base = `${STOREFRONT_CONFIG.apiBase}/collections`;

  private cache: Promise<Collection[]> | null = null;

  list(): Promise<Collection[]> {
    if (!this.cache) {
      this.cache = firstValueFrom(this.http.get<Collection[]>(this.base));
    }
    return this.cache;
  }

  async findBySlug(slug: string): Promise<Collection | undefined> {
    const all = await this.list();
    return all.find((c) => c.slug === slug);
  }
}
