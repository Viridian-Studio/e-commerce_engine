import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Order } from '@ecom/types';
import { ProductPrice } from '../../../shared/components/product-price/product-price';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { StripeService } from '../../../core/api/stripe.service';

@Component({
  selector: 'app-order-confirmation',
  imports: [RouterLink, ProductPrice, TranslatePipe],
  templateUrl: './confirmation.html',
})
export class OrderConfirmation {
  private readonly i18n = inject(I18nService);
  private readonly stripe = inject(StripeService);

  // The engine has no public "get order by number" endpoint (by design — it
  // would need email verification to avoid order enumeration), so the order
  // is handed over via router state from the checkout flow. A direct link or
  // refresh falls back to a generic confirmation message.
  protected readonly order = signal<Order | null>((history.state?.order as Order | undefined) ?? null);

  // When Stripe redirects back after confirmation, the URL contains
  // ?payment_intent=pi_xxx. We fire a confirm call to the backend so it
  // checks the PI status and marks the order PAID — this is a webhook
  // fallback for local dev / setups without a configured webhook endpoint.
  protected readonly paymentConfirming = signal(false);
  protected readonly paymentConfirmed = signal(false);

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

  constructor() {
    const params = new URLSearchParams(window.location.search);
    const paymentIntentId = params.get('payment_intent');
    if (paymentIntentId) void this.confirmPayment(paymentIntentId);
  }

  private async confirmPayment(paymentIntentId: string): Promise<void> {
    this.paymentConfirming.set(true);
    try {
      const res = await this.stripe.confirmPaymentIntent(paymentIntentId);
      this.paymentConfirmed.set(res.paid);
    } catch {
      // Non-fatal — the webhook may have already handled it, or will.
    } finally {
      this.paymentConfirming.set(false);
    }
  }
}
