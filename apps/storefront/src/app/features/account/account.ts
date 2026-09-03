import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/api/auth.service';
import { OrderService } from '../../core/api/order.service';
import { ToastService } from '../../core/toast.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { CurrencyService } from '../../core/currency.service';
import { ProductPrice } from '../../shared/components/product-price/product-price';

@Component({
  selector: 'app-account',
  imports: [RouterLink, TranslatePipe, ProductPrice],
  templateUrl: './account.html',
})
export class Account {
  private readonly auth = inject(AuthService);
  private readonly orderService = inject(OrderService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  protected readonly currencyService = inject(CurrencyService);

  protected readonly customer = this.auth.customer;
  protected readonly orders = this.orderService.orders;
  protected readonly loading = this.orderService.loading;

  protected readonly hasOrders = computed(() => this.orders().length > 0);

  constructor() {
    void this.orderService.loadMyOrders();
  }

  protected logout(): void {
    this.auth.logout();
    this.toast.info('Sikeresen kijelentkeztél.');
    void this.router.navigateByUrl('/');
  }

  protected statusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'Függőben',
      confirmed: 'Megerősítve',
      processing: 'Feldolgozás alatt',
      shipped: 'Feladva',
      delivered: 'Kézbesítve',
      cancelled: 'Törölve',
      refunded: 'Visszatérítve',
    };
    return map[status] ?? status;
  }

  protected paymentLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'Függőben',
      paid: 'Fizetve',
      failed: 'Sikertelen',
      refunded: 'Visszatérítve',
      partially_refunded: 'Részben visszatérítve',
    };
    return map[status] ?? status;
  }

  protected fulfillmentLabel(status: string): string {
    const map: Record<string, string> = {
      unfulfilled: 'Nem teljesített',
      partial: 'Részlegesen teljesített',
      fulfilled: 'Teljesítve',
    };
    return map[status] ?? status;
  }

  protected formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
