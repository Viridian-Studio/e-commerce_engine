import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { Cart } from '@ecom/types';
import { STOREFRONT_CONFIG } from '../config/storefront.config';
import { CurrencyService } from '../currency.service';

const TOKEN_KEY = 'ecom_storefront_cart_token';

export interface AddCartItemInput {
  productId: string;
  variantId?: string;
  name: string;
  sku?: string;
  quantity: number;
  price: number;
  /** Currency the `price` is denominated in (the product's own currency). */
  currency?: string;
  image?: string;
}

/**
 * Single source of truth for the cart. Every method round-trips through the
 * engine's /api/storefront/cart* endpoints — quantities/line prices shown
 * here are exactly what the backend returned, never recomputed locally.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly currencyService = inject(CurrencyService);
  private readonly base = `${STOREFRONT_CONFIG.apiBase}/cart`;

  readonly cart = signal<Cart | null>(null);
  readonly loading = signal(false);
  readonly drawerOpen = signal(false);

  readonly itemCount = computed(() => this.cart()?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0);
  /** Exact subtotal in the store's own currency — used for checkout math (shipping/discount/total). */
  readonly subtotal = computed(() => this.cart()?.items.reduce((sum, i) => sum + i.price * i.quantity, 0) ?? 0);
  readonly currency = computed(() => this.cart()?.currency ?? 'EUR');

  /**
   * Subtotal in the *selected display currency*, with each line rounded to the
   * display currency's precision before summing. This guarantees the displayed
   * subtotal equals the sum of the displayed line totals — e.g. in HUF (0
   * decimals) three 1.99 € lines show 787 Ft each and a 2 361 Ft subtotal,
   * instead of the 2 358 Ft you'd get from rounding the converted total once.
   */
  readonly displaySubtotal = computed(() => {
    const items = this.cart()?.items;
    if (!items) return 0;
    const storeCurrency = this.currency();
    const selected = this.currencyService.selected();
    return items.reduce((sum, i) => {
      const converted = this.currencyService.convert(i.price * i.quantity, storeCurrency);
      return sum + this.currencyService.roundForDisplay(converted, selected);
    }, 0);
  });

  private get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private set token(value: string | null) {
    if (value) localStorage.setItem(TOKEN_KEY, value);
    else localStorage.removeItem(TOKEN_KEY);
  }

  /** Loads the existing cart (if any) — call once the store is resolved. */
  async init(): Promise<void> {
    const token = this.token;
    if (!token) return;
    this.loading.set(true);
    try {
      const cart = await firstValueFrom(this.http.get<Cart>(this.base, { params: { token } }));
      this.cart.set(cart);
    } catch {
      this.token = null;
    } finally {
      this.loading.set(false);
    }
  }

  async addItem(item: AddCartItemInput): Promise<void> {
    this.loading.set(true);
    try {
      const params: Record<string, string> = {};
      if (this.token) params['token'] = this.token;
      const cart = await firstValueFrom(this.http.post<Cart>(`${this.base}/items`, item, { params }));
      this.applyCart(cart);
    } finally {
      this.loading.set(false);
    }
  }

  async updateItem(itemId: string, quantity: number): Promise<void> {
    if (!this.token) return;
    this.loading.set(true);
    try {
      const cart = await firstValueFrom(
        this.http.post<Cart>(`${this.base}/items/${itemId}`, { quantity }, { params: { token: this.token } }),
      );
      this.applyCart(cart);
    } finally {
      this.loading.set(false);
    }
  }

  async removeItem(itemId: string): Promise<void> {
    if (!this.token) return;
    this.loading.set(true);
    try {
      const cart = await firstValueFrom(
        this.http.post<Cart>(`${this.base}/items/${itemId}/remove`, {}, { params: { token: this.token } }),
      );
      this.applyCart(cart);
    } finally {
      this.loading.set(false);
    }
  }

  /** Called after a successful checkout — the backend already cleared the cart. */
  reset(): void {
    this.token = null;
    this.cart.set(null);
  }

  openDrawer(): void {
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  getToken(): string | null {
    return this.token;
  }

  private applyCart(cart: Cart): void {
    this.cart.set(cart);
    if (cart.token) this.token = cart.token;
  }
}
