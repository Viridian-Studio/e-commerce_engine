import { Controller, Headers, HttpCode, Post, Req, BadRequestException, Logger, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type Stripe from 'stripe';
import { StripePaymentProvider } from './stripe.provider';
import { PaymentsService } from './payments.service';
import { Public } from '../../common/decorators/public.decorator';

/**
 * Receives Stripe webhook events. The route is `@Public()` (no JWT) but
 * verified via the Stripe signature header — nobody without the webhook
 * signing secret can forge an event.
 *
 * For multi-store setups with per-store Stripe accounts, pass the store id
 * as a query param (`/api/webhooks/stripe?storeId=...`) so the correct
 * webhook signing secret is used. Without it, the global env secret is used.
 *
 * Requires the raw request body; the Express adapter is configured with
 * `rawBody: true` in main.ts so `req.rawBody` is available.
 */
@ApiTags('webhooks')
@Public()
@Controller('webhooks')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(
    private readonly stripe: StripePaymentProvider,
    private readonly payments: PaymentsService,
  ) {}

  @Post('stripe')
  @HttpCode(200)
  @ApiOperation({ summary: 'Stripe webhook receiver' })
  async handle(
    @Req() req: { rawBody?: Buffer },
    @Headers('stripe-signature') signature: string,
    @Query('storeId') storeId?: string,
  ): Promise<{ received: true }> {
    if (!req.rawBody) throw new BadRequestException('Raw body not available');
    if (!signature) throw new BadRequestException('Missing stripe-signature header');

    let event: Stripe.Event;
    try {
      event = await this.stripe.constructWebhookEvent(req.rawBody, signature, storeId);
    } catch (err) {
      this.logger.warn(`Webhook signature verification failed: ${(err as Error).message}`);
      throw new BadRequestException('Invalid signature');
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent;
        const orderId = intent.metadata?.orderId;
        this.logger.log(`PaymentIntent ${intent.id} succeeded for order ${orderId}`);
        await this.payments.markPaidByTransactionId(intent.id, 'stripe');
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent;
        this.logger.warn(`PaymentIntent ${intent.id} failed (order ${intent.metadata?.orderId})`);
        break;
      }
      default:
        this.logger.debug(`Unhandled Stripe event: ${event.type}`);
    }

    return { received: true };
  }
}
