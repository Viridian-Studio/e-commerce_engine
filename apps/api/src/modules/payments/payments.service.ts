import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { PaymentStatus } from '@ecom/types';

/**
 * Payment provider interface. External providers (Stripe, PayPal, ...) can
 * implement this and be registered later without changing business logic.
 */
export interface PaymentProvider {
  readonly name: string;
  charge(params: {
    orderId: string;
    amount: number;
    currency: string;
    method?: string;
    token?: string;
  }): Promise<{ success: boolean; transactionId?: string; error?: string }>;
  refund(params: { orderId: string; transactionId: string; amount?: number }): Promise<{
    success: boolean;
    error?: string;
  }>;
}

/**
 * Manual / mock provider used for the MVP. Records a fake transaction id.
 */
@Injectable()
export class ManualPaymentProvider implements PaymentProvider {
  readonly name = 'manual';
  private readonly logger = new Logger(ManualPaymentProvider.name);

  async charge(params: { orderId: string; amount: number; currency: string }) {
    const transactionId = `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.logger.log(`Manual charge ${params.amount} ${params.currency} for order ${params.orderId} -> ${transactionId}`);
    return { success: true, transactionId };
  }

  async refund(params: { orderId: string }) {
    this.logger.log(`Manual refund for order ${params.orderId}`);
    return { success: true };
  }
}

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    private readonly manualProvider: ManualPaymentProvider,
  ) {}

  getProvider(name?: string): PaymentProvider {
    // For now only manual is supported. Extend with a registry later.
    return this.manualProvider;
  }

  async capture(orderId: string, providerName?: string): Promise<{ success: boolean; transactionId?: string }> {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) return { success: false };
    const provider = this.getProvider(providerName);
    const res = await provider.charge({
      orderId,
      amount: order.totals.total,
      currency: order.totals.currency,
    });
    if (res.success && res.transactionId) {
      await this.orderModel
        .updateOne(
          { _id: new Types.ObjectId(orderId) },
          { paymentStatus: PaymentStatus.PAID, 'payment.transactionId': res.transactionId, 'payment.provider': provider.name },
        )
        .exec();
    }
    return res;
  }

  async refund(orderId: string): Promise<{ success: boolean }> {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) return { success: false };
    const provider = this.getProvider(order.payment?.provider);
    const res = await provider.refund({
      orderId,
      transactionId: order.payment?.transactionId ?? '',
    });
    if (res.success) {
      await this.orderModel
        .updateOne({ _id: new Types.ObjectId(orderId) }, { paymentStatus: PaymentStatus.REFUNDED })
        .exec();
    }
    return res;
  }
}
