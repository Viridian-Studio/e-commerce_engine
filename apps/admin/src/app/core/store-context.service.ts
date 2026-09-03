import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { Store } from '@ecom/types';

const STORE_KEY = 'ecom_admin_store_id';

@Injectable({ providedIn: 'root' })
export class StoreContextService {
  private readonly http = inject(HttpClient);

  readonly stores = signal<Store[]>([]);
  readonly currentStoreId = signal<string | null>(localStorage.getItem(STORE_KEY));
  readonly currentStore = computed(
    () => this.stores().find((s) => s._id === this.currentStoreId()) ?? null,
  );
  readonly loaded = signal(false);

  async loadStores(): Promise<void> {
    const stores = await firstValueFrom(this.http.get<Store[]>('/api/admin/stores'));
    this.stores.set(stores);
    this.loaded.set(true);
    const current = this.currentStoreId();
    if (!current || !stores.some((s) => s._id === current)) {
      this.setStore(stores[0]?._id ?? null);
    }
  }

  setStore(id: string | null): void {
    this.currentStoreId.set(id);
    if (id) localStorage.setItem(STORE_KEY, id);
    else localStorage.removeItem(STORE_KEY);
  }

  /** Call after creating/updating/deleting a store so the selector stays in sync. */
  async refresh(): Promise<void> {
    await this.loadStores();
  }
}
