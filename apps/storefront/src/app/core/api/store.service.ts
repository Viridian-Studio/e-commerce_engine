import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { Store } from '@ecom/types';
import { STOREFRONT_CONFIG } from '../config/storefront.config';

/**
 * Resolves and holds the active store. Must finish loading before any other
 * storefront API call fires, since every one of them needs the store id
 * (see store-header.interceptor.ts) — wired up via an app initializer.
 */
@Injectable({ providedIn: 'root' })
export class StoreService {
  private readonly http = inject(HttpClient);

  readonly store = signal<Store | null>(null);
  readonly storeId = computed(() => this.store()?._id ?? null);
  readonly loaded = signal(false);

  private loadPromise: Promise<void> | null = null;

  load(): Promise<void> {
    if (!this.loadPromise) {
      this.loadPromise = firstValueFrom(
        this.http.get<Store>(`${STOREFRONT_CONFIG.apiBase}/store`, {
          params: { slug: STOREFRONT_CONFIG.storeSlug },
        }),
      )
        .then((store) => {
          this.store.set(store);
        })
        .catch((err) => {
          console.error('Failed to resolve store', err);
        })
        .finally(() => this.loaded.set(true));
    }
    return this.loadPromise;
  }
}
