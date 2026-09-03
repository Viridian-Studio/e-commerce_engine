import { Component, effect, inject, input, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import type { Order, OrderStatus, PaymentStatus } from '@ecom/types';
import { OrderService, PaymentService } from '../../../core/services/order.service';
import { NotificationService } from '../../../core/notification.service';
import { extractErrorMessage } from '../../../core/http-error';
import { StatusBadge } from '../../../shared/status-badge/status-badge';
import { Select } from '../../../shared/select/select';

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'];

@Component({
  selector: 'app-order-detail',
  imports: [RouterLink, CurrencyPipe, DatePipe, FormsModule, StatusBadge, Select],
  templateUrl: './order-detail.html',
})
export class OrderDetail {
  private readonly orderService = inject(OrderService);
  private readonly paymentService = inject(PaymentService);
  private readonly notifications = inject(NotificationService);

  readonly id = input.required<string>();

  protected readonly order = signal<Order | null>(null);
  protected readonly loading = signal(true);
  protected readonly updatingStatus = signal(false);
  protected readonly updatingPayment = signal(false);
  protected readonly capturing = signal(false);

  protected readonly statusOptions = ORDER_STATUSES.map((s) => ({ value: s, label: s }));
  protected readonly paymentStatusOptions = PAYMENT_STATUSES.map((s) => ({ value: s, label: s }));

  protected nextStatus = '';
  protected nextPaymentStatus = '';
  protected statusNote = '';

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) void this.load(id);
    });
  }

  private async load(id: string): Promise<void> {
    this.loading.set(true);
    try {
      const order = await this.orderService.get(id);
      this.order.set(order);
      this.nextStatus = order.status;
      this.nextPaymentStatus = order.paymentStatus;
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.loading.set(false);
    }
  }

  protected async updateStatus(): Promise<void> {
    const order = this.order();
    if (!order || !this.nextStatus) return;
    this.updatingStatus.set(true);
    try {
      const updated = await this.orderService.updateStatus(
        order._id,
        this.nextStatus as OrderStatus,
        this.statusNote || undefined,
      );
      this.order.set(updated);
      this.statusNote = '';
      this.notifications.success('Order status updated');
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.updatingStatus.set(false);
    }
  }

  protected async updatePaymentStatus(): Promise<void> {
    const order = this.order();
    if (!order || !this.nextPaymentStatus) return;
    this.updatingPayment.set(true);
    try {
      const updated = await this.orderService.updatePayment(order._id, this.nextPaymentStatus as PaymentStatus);
      this.order.set(updated);
      this.notifications.success('Payment status updated');
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.updatingPayment.set(false);
    }
  }

  protected async capture(): Promise<void> {
    const order = this.order();
    if (!order) return;
    this.capturing.set(true);
    try {
      await this.paymentService.capture(order._id);
      this.notifications.success('Payment captured');
      await this.load(order._id);
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.capturing.set(false);
    }
  }

  protected async refund(): Promise<void> {
    const order = this.order();
    if (!order) return;
    this.capturing.set(true);
    try {
      await this.paymentService.refund(order._id);
      this.notifications.success('Payment refunded');
      await this.load(order._id);
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.capturing.set(false);
    }
  }
}
