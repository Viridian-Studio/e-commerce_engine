import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { Address, Order } from '@ecom/types';
import { STOREFRONT_CONFIG } from '../config/storefront.config';
import { SKIP_ERROR_TOAST } from '../http-context';
import { CartService } from './cart.service';

export interface CheckoutInput {
  token: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  shippingAddress: Address;
  billingAddress?: Address;
  discountCode?: string;
  paymentMethod?: string;
}

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly http = inject(HttpClient);
  private readonly cart = inject(CartService);
  private readonly base = STOREFRONT_CONFIG.apiBase;

  /** Live, backend-authoritative shipping estimate — never computed locally. */
  getShippingRate(country: string, subtotal: number): Promise<{ price: number; name: string }> {
    return firstValueFrom(
      this.http.get<{ price: number; name: string }>(`${this.base}/shipping/rate`, {
        params: { country, subtotal: String(subtotal) },
      }),
    );
  }

  /**
   * Live, backend-authoritative discount preview — validates the code and
   * returns the exact amount the engine would deduct, without recording a
   * usage (only the final checkout() call does that).
   */
  previewDiscount(code: string, subtotal: number): Promise<{ amount: number; code: string }> {
    return firstValueFrom(
      this.http.get<{ amount: number; code: string }>(`${this.base}/discount/preview`, {
        params: { code, subtotal: String(subtotal) },
        context: new HttpContext().set(SKIP_ERROR_TOAST, true),
      }),
    );
  }

  async placeOrder(input: CheckoutInput): Promise<Order> {
    const order = await firstValueFrom(this.http.post<Order>(`${this.base}/checkout`, input));
    this.cart.reset();
    return order;
  }
}
