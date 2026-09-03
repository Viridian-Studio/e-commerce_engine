import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import type { PaymentProvider } from './payments.service';
import { Store, StoreDocument } from '../stores/schemas/store.schema';

/**
 * Stripe payment provider. Uses PaymentIntents (not Charges — Charges are
 * deprecated by Stripe). The flow is:
 *
 *   1. Storefront calls POST /storefront/payments/intent → createPaymentIntent
 *      returns a client_secret + id.
 *   2. The browser confirms the card via Stripe.js using the client_secret.
 *   3. Stripe sends a `payment_intent.succeeded` webhook → the webhook
 *      handler marks the order PAID. (The admin "capture" button is a fallback
 *      that manually confirms an already-succeeded intent.)
 *
 * Stripe keys are resolved per-store (from `store.payment.stripeSecretKey` etc.)
 * with a fallback to the global env vars (`STRIPE_SECRET_KEY`, etc.) — that
 * fallback covers single-store deployments and the seed/dev setup.
 *
 * `charge()` here is used by the admin capture endpoint — it retrieves the
 * PaymentIntent by id and reports its status. The actual money movement
 * happens on the client side via Stripe.js confirmation.
 */
@Injectable()
export class StripePaymentProvider implements PaymentProvider, OnModuleInit {
  readonly name = 'stripe';
  private readonly logger = new Logger(StripePaymentProvider.name);
  private defaultClient!: Stripe;

  constructor(
    private readonly config: ConfigService,
    @InjectModel(Store.name) private readonly storeModel: Model<StoreDocument>,
  ) {}

  onModuleInit(): void {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      this.logger.warn('STRIPE_SECRET_KEY not set — Stripe provider will fall back to per-store keys');
      return;
    }
    this.defaultClient = new Stripe(secretKey, { apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion });
  }

  // ─── Key resolution ──────────────────────────────────────────────────────

  /** Returns the publishable key for a store (or the global fallback). */
  async publishableKey(storeId?: string): Promise<string | null> {
    const storeKey = storeId ? await this.getStoreKey(storeId, 'stripePublishableKey') : null;
    return storeKey ?? this.config.get<string>('STRIPE_PUBLISHABLE_KEY') ?? null;
  }

  /** Returns the webhook signing secret for a store (or the global fallback). */
  async webhookSecret(storeId?: string): Promise<string | null> {
    const storeKey = storeId ? await this.getStoreKey(storeId, 'stripeWebhookSecret') : null;
    return storeKey ?? this.config.get<string>('STRIPE_WEBHOOK_SECRET') ?? null;
  }

  private async getStoreKey(storeId: string, field: 'stripeSecretKey' | 'stripePublishableKey' | 'stripeWebhookSecret'): Promise<string | null> {
    const store = await this.storeModel.findById(storeId).select('payment').lean().exec();
    return (store?.payment as Record<string, string | undefined> | undefined)?.[field] ?? null;
  }

  /**
   * Returns a Stripe client for the given store. If the store has its own
   * `stripeSecretKey`, a new client is created for it; otherwise the global
   * default client is used.
   */
  private async getClient(storeId?: string): Promise<Stripe> {
    if (!storeId) return this.ensureDefault();
    const secretKey = await this.getStoreKey(storeId, 'stripeSecretKey');
    if (secretKey) return new Stripe(secretKey, { apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion });
    return this.ensureDefault();
  }

  private ensureDefault(): Stripe {
    if (!this.defaultClient) throw new Error('Stripe is not configured (STRIPE_SECRET_KEY missing and store has no stripeSecretKey)');
    return this.defaultClient;
  }

  // ─── Payment operations ──────────────────────────────────────────────────

  /** Creates a PaymentIntent for the given amount (in the store's currency). */
  async createPaymentIntent(params: {
    orderId: string;
    amount: number;
    currency: string;
    email?: string;
    storeId?: string;
  }): Promise<{ id: string; clientSecret: string }> {
    const client = await this.getClient(params.storeId);
    // Stripe expects amounts in the smallest currency unit (cents). HUF, JPY
    // etc. are zero-decimal — multiply by 1, not 100.
    const unitMultiplier = ZERO_DECIMAL_CURRENCIES.has(params.currency.toUpperCase()) ? 1 : 100;
    const intent = await client.paymentIntents.create({
      amount: Math.round(params.amount * unitMultiplier),
      currency: params.currency.toLowerCase(),
      metadata: { orderId: String(params.orderId) },
      receipt_email: params.email,
      automatic_payment_methods: { enabled: true },
    });
    return { id: intent.id, clientSecret: intent.client_secret! };
  }

  /**
   * Admin "capture" — retrieves the PaymentIntent and reports whether it
   * succeeded. The real confirmation happens client-side via Stripe.js; this
   * is a status check / manual reconciliation path.
   */
  async charge(params: { orderId: string; amount: number; currency: string; token?: string; storeId?: string }) {
    const client = await this.getClient(params.storeId);
    const intentId = params.token;
    if (!intentId) return { success: false, error: 'Missing PaymentIntent id (token)' };
    try {
      const intent = await client.paymentIntents.retrieve(intentId);
      if (intent.status === 'succeeded') {
        return { success: true, transactionId: intent.id };
      }
      return { success: false, error: `PaymentIntent status is ${intent.status}` };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  async refund(params: { orderId: string; transactionId: string; amount?: number; storeId?: string }) {
    const client = await this.getClient(params.storeId);
    try {
      await client.refunds.create({
        payment_intent: params.transactionId,
        ...(params.amount ? { amount: Math.round(params.amount) } : {}),
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  /** Verifies and constructs a Stripe webhook event from the raw body + sig. */
  async constructWebhookEvent(payload: Buffer, signature: string, storeId?: string): Promise<Stripe.Event> {
    const client = await this.getClient(storeId);
    const secret = await this.webhookSecret(storeId);
    if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET not configured');
    return client.webhooks.constructEvent(payload, signature, secret);
  }

  /** Retrieves a PaymentIntent's status by id — used as a webhook fallback. */
  async retrievePaymentIntent(intentId: string, storeId?: string): Promise<{ id: string; status: string }> {
    const client = await this.getClient(storeId);
    const intent = await client.paymentIntents.retrieve(intentId);
    return { id: intent.id, status: intent.status };
  }
}

/** Currencies with no minor unit — Stripe expects amounts in whole units. */
const ZERO_DECIMAL_CURRENCIES = new Set([
  'BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF', 'HUF',
]);
