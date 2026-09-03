import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsController } from './payments.controller';
import { PaymentsService, ManualPaymentProvider } from './payments.service';
import { Order, OrderSchema } from '../orders/schemas/order.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }])],
  controllers: [PaymentsController],
  providers: [PaymentsService, ManualPaymentProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}
