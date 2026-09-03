import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Order } from '@ecom/types';
import { ProductPrice } from '../../../shared/components/product-price/product-price';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-order-confirmation',
  imports: [RouterLink, ProductPrice, TranslatePipe],
  templateUrl: './confirmation.html',
})
export class OrderConfirmation {
  private readonly i18n = inject(I18nService);

  // The engine has no public "get order by number" endpoint (by design — it
  // would need email verification to avoid order enumeration), so the order
  // is handed over via router state from the checkout flow. A direct link or
  // refresh falls back to a generic confirmation message.
  protected readonly order = signal<Order | null>((history.state?.order as Order | undefined) ?? null);

  protected readonly placedMessage = computed(() => {
    const o = this.order();
    if (!o) return '';
    return this.i18n.lang() === 'hu'
      ? `A(z) #${o.number} számú rendelésed rögzítettük. Visszaigazolást küldtünk erre a címre: ${o.customer?.email}.`
      : `Your order #${o.number} has been placed. A confirmation has been sent to ${o.customer?.email}.`;
  });

  protected readonly fallbackMessage = computed(() =>
    this.i18n.lang() === 'hu'
      ? 'A rendelésedet sikeresen rögzítettük. A teljes visszaigazolást és a rendelés részleteit emailben küldtük el.'
      : 'Your order has been placed successfully. Check your email for the full confirmation and order details.',
  );
}
