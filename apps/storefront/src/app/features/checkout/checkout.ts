import { Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/api/cart.service';
import { CheckoutService } from '../../core/api/checkout.service';
import { StripeService } from '../../core/api/stripe.service';
import { CurrencyService } from '../../core/currency.service';
import { ToastService } from '../../core/toast.service';
import { ProductPrice } from '../../shared/components/product-price/product-price';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import type { Order } from '@ecom/types';

type Step = 'cart' | 'information' | 'shipping' | 'payment';

const STEPS: { key: Step; labelKey: string }[] = [
  { key: 'cart', labelKey: 'checkout.step.cart' },
  { key: 'information', labelKey: 'checkout.step.information' },
  { key: 'shipping', labelKey: 'checkout.step.shipping' },
  { key: 'payment', labelKey: 'checkout.step.payment' },
];

// Hungary first — this is the storefront's launch market.
const COUNTRIES = [
  { code: 'HU', name: 'Magyarország' },
  { code: 'AT', name: 'Ausztria' },
  { code: 'DE', name: 'Németország' },
  { code: 'RO', name: 'Románia' },
  { code: 'SK', name: 'Szlovákia' },
  { code: 'SI', name: 'Szlovénia' },
  { code: 'HR', name: 'Horvátország' },
  { code: 'RS', name: 'Szerbia' },
];

@Component({
  selector: 'app-checkout-page',
  imports: [ReactiveFormsModule, RouterLink, ProductPrice, TranslatePipe, LowerCasePipe],
  templateUrl: './checkout.html',
})
export class CheckoutPage {
  private readonly fb = inject(FormBuilder);
  private readonly checkoutService = inject(CheckoutService);
  private readonly stripeService = inject(StripeService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  protected readonly cart = inject(CartService);
  protected readonly currencyService = inject(CurrencyService);

  protected readonly steps = STEPS;
  protected readonly countries = COUNTRIES;
  protected readonly step = signal<Step>('cart');

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: [''],
    address: this.fb.nonNullable.group({
      line1: ['', Validators.required],
      line2: [''],
      city: ['', Validators.required],
      state: [''],
      postalCode: [''],
      country: ['HU', Validators.required],
    }),
  });

  protected readonly shippingRate = signal<{ price: number; name: string } | null>(null);
  protected readonly shippingLoading = signal(false);
  protected readonly discountCode = signal('');
  protected readonly discountPreview = signal<{ amount: number; code: string } | null>(null);
  protected readonly discountChecking = signal(false);
  protected readonly discountError = signal<string | null>(null);
  protected readonly paymentMethod = signal<'card' | 'cod'>('card');
  protected readonly placing = signal(false);
  protected readonly confirming = signal(false);
  protected readonly stripeReady = signal(false);
  protected readonly stripeError = signal<string | null>(null);

  /** The order created by placeOrder — kept around so we can create a PaymentIntent for it. */
  private pendingOrder: Order | null = null;

  private discountDebounce?: ReturnType<typeof setTimeout>;

  private readonly stripeContainer = viewChild<ElementRef<HTMLElement>>('stripeContainer');

  protected readonly total = computed(
    () => this.cart.subtotal() + (this.shippingRate()?.price ?? 0) - (this.discountPreview()?.amount ?? 0),
  );

  constructor() {
    effect(() => {
      if (this.cart.cart() !== null && this.cart.itemCount() === 0 && this.step() !== 'payment') {
        void this.router.navigateByUrl('/cart');
      }
    });

    // When the Stripe container appears (after placeOrder with card), mount the PaymentElement.
    effect(() => {
      const ready = this.stripeReady();
      const container = this.stripeContainer();
      const order = this.pendingOrder;
      if (!ready || !container || !order) return;
      const email = this.form.controls.email.value;
      void this.stripeService
        .mountPaymentElement(container.nativeElement, order._id, email)
        .catch((err) => this.stripeError.set((err as Error).message));
    });
  }

  protected goTo(step: Step): void {
    const currentIndex = STEPS.findIndex((s) => s.key === this.step());
    const targetIndex = STEPS.findIndex((s) => s.key === step);
    if (targetIndex <= currentIndex) this.step.set(step);
  }

  protected continueFromCart(): void {
    if (this.cart.itemCount() === 0) return;
    this.step.set('information');
  }

  protected async continueFromInformation(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.step.set('shipping');
    this.shippingLoading.set(true);
    try {
      const country = this.form.controls.address.controls.country.value;
      const rate = await this.checkoutService.getShippingRate(country, this.cart.subtotal());
      this.shippingRate.set(rate);
    } catch {
      this.shippingRate.set({ price: 0, name: 'Standard szállítás' });
    } finally {
      this.shippingLoading.set(false);
    }
  }

  protected continueFromShipping(): void {
    this.step.set('payment');
  }

  protected onDiscountCodeInput(value: string): void {
    this.discountCode.set(value);
    this.discountPreview.set(null);
    this.discountError.set(null);
    clearTimeout(this.discountDebounce);

    const code = value.trim();
    if (!code) {
      this.discountChecking.set(false);
      return;
    }

    this.discountChecking.set(true);
    this.discountDebounce = setTimeout(async () => {
      try {
        const result = await this.checkoutService.previewDiscount(code, this.cart.subtotal());
        if (this.discountCode().trim() === code) this.discountPreview.set(result);
      } catch {
        if (this.discountCode().trim() === code) this.discountError.set('Érvénytelen vagy lejárt kód.');
      } finally {
        if (this.discountCode().trim() === code) this.discountChecking.set(false);
      }
    }, 450);
  }

  protected async placeOrder(): Promise<void> {
    const token = this.cart.getToken();
    if (!token || this.form.invalid || this.placing()) return;

    this.placing.set(true);
    try {
      const value = this.form.getRawValue();
      const order = await this.checkoutService.placeOrder({
        token,
        email: value.email,
        firstName: value.firstName,
        lastName: value.lastName,
        phone: value.phone || undefined,
        shippingAddress: {
          firstName: value.firstName,
          lastName: value.lastName,
          line1: value.address.line1,
          line2: value.address.line2 || undefined,
          city: value.address.city,
          state: value.address.state || undefined,
          postalCode: value.address.postalCode || undefined,
          country: value.address.country,
          phone: value.phone || undefined,
        },
        discountCode: this.discountCode() || undefined,
        paymentMethod: this.paymentMethod(),
      });

      if (this.paymentMethod() === 'card') {
        // Keep the order around and show the Stripe PaymentElement for card payment.
        this.pendingOrder = order;
        this.stripeReady.set(true);
      } else {
        // COD — order is complete, go straight to confirmation.
        void this.router.navigate(['/checkout/confirmation', order.number], { state: { order } });
      }
    } catch {
      this.toast.error('Nem sikerült leadni a rendelést. Ellenőrizd az adataidat, és próbáld újra.');
    } finally {
      this.placing.set(false);
    }
  }

  protected async confirmStripePayment(): Promise<void> {
    if (!this.pendingOrder || this.confirming()) return;
    this.confirming.set(true);
    this.stripeError.set(null);
    try {
      const returnUrl = `${window.location.origin}/checkout/confirmation/${this.pendingOrder.number}`;
      const result = await this.stripeService.confirmPayment(returnUrl);
      if (!result.success) {
        this.stripeError.set(result.error ?? 'A fizetés sikertelen.');
      }
      // On success, Stripe.js redirects to returnUrl — no need to navigate here.
    } catch {
      this.stripeError.set('Váratlan hiba a fizetés során. Próbáld újra.');
    } finally {
      this.confirming.set(false);
    }
  }
}
