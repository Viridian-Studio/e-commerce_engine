import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { Order, OrderStatus, PaymentStatus } from '@ecom/types';
import { ResourceService } from './resource.service';

@Injectable({ providedIn: 'root' })
export class OrderService extends ResourceService<Order> {
  constructor() {
    super('/api/admin/orders');
  }

  updateStatus(id: string, status: OrderStatus, note?: string): Promise<Order> {
    return firstValueFrom(this.http.patch<Order>(`${this.basePath}/${id}/status`, { status, note }));
  }

  updatePayment(id: string, paymentStatus: PaymentStatus, transactionId?: string): Promise<Order> {
    return firstValueFrom(
      this.http.patch<Order>(`${this.basePath}/${id}/payment`, { paymentStatus, transactionId }),
    );
  }
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly basePath = '/api/admin/payments';

  capture(orderId: string): Promise<{ success: boolean; transactionId?: string }> {
    return firstValueFrom(
      this.http.post<{ success: boolean; transactionId?: string }>(
        `${this.basePath}/orders/${orderId}/capture`,
        {},
      ),
    );
  }

  refund(orderId: string): Promise<{ success: boolean }> {
    return firstValueFrom(
      this.http.post<{ success: boolean }>(`${this.basePath}/orders/${orderId}/refund`, {}),
    );
  }
}
