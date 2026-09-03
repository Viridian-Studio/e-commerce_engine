import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Order } from '@ecom/types';
import { ProductPrice } from '../../../shared/components/product-price/product-price';

@Component({
  selector: 'app-order-confirmation',
  imports: [RouterLink, ProductPrice],
  templateUrl: './confirmation.html',
})
export class OrderConfirmation {
  // The engine has no public "get order by number" endpoint (by design — it
  // would need email verification to avoid order enumeration), so the order
  // is handed over via router state from the checkout flow. A direct link or
  // refresh falls back to a generic confirmation message.
  protected readonly order = signal<Order | null>((history.state?.order as Order | undefined) ?? null);
}
