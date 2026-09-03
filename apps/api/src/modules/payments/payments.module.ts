import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsController } from './payments.controller';
import { StripeWebhookController } from './stripe-webhook.controller';
import { PaymentsService, ManualPaymentProvider } from './payments.service';
import { StripePaymentProvider } from './stripe.provider';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { Store, StoreSchema } from '../stores/schemas/store.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Order.name, schema: OrderSchema },
    { name: Store.name, schema: StoreSchema },
  ])],
  controllers: [PaymentsController, StripeWebhookController],
  providers: [PaymentsService, ManualPaymentProvider, StripePaymentProvider],
  exports: [PaymentsService, StripePaymentProvider],
})
export class PaymentsModule {}
