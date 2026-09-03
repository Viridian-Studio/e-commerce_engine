import { Injectable, computed, signal } from '@angular/core';

const STORAGE_KEY = 'ecom_storefront_wishlist';

/**
 * Guest wishlist, kept entirely in localStorage. This is deliberately behind
 * the same small interface (has/toggle/ids) an authenticated, API-backed
 * implementation would expose, so swapping it in for signed-in customers
 * later is a drop-in replacement with no component changes.
 */
@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly _ids = signal<Set<string>>(this.readStorage());
  readonly ids = computed(() => this._ids());
  readonly count = computed(() => this._ids().size);

  has(productId: string): boolean {
    return this._ids().has(productId);
  }

  toggle(productId: string): void {
    const next = new Set(this._ids());
    if (next.has(productId)) next.delete(productId);
    else next.add(productId);
    this._ids.set(next);
    this.writeStorage(next);
  }

  private readStorage(): Set<string> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  }

  private writeStorage(ids: Set<string>): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
    } catch {
      /* storage unavailable (e.g. private browsing) — wishlist just won't persist */
    }
  }
}
