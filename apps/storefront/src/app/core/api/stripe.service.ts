import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { loadStripe, type Stripe, type StripeElements, type StripePaymentElement } from '@stripe/stripe-js';
import { STOREFRONT_CONFIG } from '../config/storefront.config';

/**
 * Storefront-side Stripe helper. Loads Stripe.js once, creates a PaymentElement
 * for a given PaymentIntent client_secret, and exposes a `confirm()` that
 * submits the card data directly to Stripe (the engine never sees card
 * details). The publishable key is safe to expose to the browser; the secret
 * key stays server-side.
 */
@Injectable({ providedIn: 'root' })
export class StripeService {
  private readonly http = inject(HttpClient);
  private readonly base = STOREFRONT_CONFIG.apiBase;

  private stripePromise: Promise<Stripe | null> | null = null;
  private elements: StripeElements | null = null;
  private paymentElement: StripePaymentElement | null = null;

  readonly publishableKey = signal<string | null>(null);

  private getStripe(): Promise<Stripe | null> {
    if (!this.stripePromise) {
      const key = this.publishableKey() ?? '';
      this.stripePromise = loadStripe(key);
    }
    return this.stripePromise;
  }

  /** Sets the publishable key (called once on app init from the store config). */
  setPublishableKey(key: string): void {
    this.publishableKey.set(key);
  }

  /** Fetches the publishable key from the backend and stores it. Called on app init. */
  async loadPublishableKey(): Promise<void> {
    try {
      const { publishableKey } = await firstValueFrom(
        this.http.get<{ publishableKey: string | null }>(`${this.base}/payments/config`),
      );
      if (publishableKey) this.publishableKey.set(publishableKey);
    } catch {
      // Stripe not configured — card payment will simply be unavailable.
    }
  }

  /**
   * Creates a PaymentIntent on the backend and mounts a Stripe PaymentElement
   * into the given container. Returns the intent id so the caller can save it
   * on the order.
   */
  async mountPaymentElement(
    container: HTMLElement,
    orderId: string,
    email?: string,
  ): Promise<{ intentId: string }> {
    const stripe = await this.getStripe();
    if (!stripe) throw new Error('Stripe.js failed to load');

    const { id, clientSecret } = await firstValueFrom(
      this.http.post<{ id: string; clientSecret: string }>(`${this.base}/payments/intent`, { orderId, email }),
    );

    this.elements = stripe.elements({ clientSecret, appearance: { theme: 'night' } });
    this.paymentElement = this.elements.create('payment', { layout: { type: 'tabs' } });
    this.paymentElement.mount(container);
    return { intentId: id };
  }

  /** Confirms the payment with Stripe.js — redirects to `returnUrl` on success. */
  async confirmPayment(returnUrl: string): Promise<{ success: boolean; error?: string }> {
    const stripe = await this.getStripe();
    if (!stripe || !this.elements) return { success: false, error: 'Stripe not initialized' };

    const { error } = await stripe.confirmPayment({
      elements: this.elements,
      confirmParams: { return_url: returnUrl },
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  /** Tears down the mounted element so it can be re-created on a retry. */
  unmount(): void {
    this.paymentElement?.unmount();
    this.paymentElement = null;
    this.elements = null;
  }

  /**
   * Webhook fallback: asks the backend to check the PaymentIntent status on
   * Stripe and mark the order paid if succeeded. Called from the confirmation
   * page when Stripe redirects back with `?payment_intent=pi_xxx`.
   */
  async confirmPaymentIntent(paymentIntentId: string): Promise<{ status: string; paid: boolean }> {
    return firstValueFrom(
      this.http.post<{ status: string; paid: boolean }>(`${this.base}/payments/confirm`, { paymentIntentId }),
    );
  }
}
