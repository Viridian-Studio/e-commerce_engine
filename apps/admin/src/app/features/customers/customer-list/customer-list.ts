import { Component, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { Customer } from '@ecom/types';
import { CustomerService } from '../../../core/services/customer.service';
import { StoreContextService } from '../../../core/store-context.service';
import { NotificationService } from '../../../core/notification.service';
import { extractErrorMessage } from '../../../core/http-error';
import { StatusBadge } from '../../../shared/status-badge/status-badge';
import { EmptyState } from '../../../shared/empty-state/empty-state';
import { LoadingState } from '../../../shared/loading-state/loading-state';
import { Pagination } from '../../../shared/pagination/pagination';
import { SearchInput } from '../../../shared/search-input/search-input';

@Component({
  selector: 'app-customer-list',
  imports: [RouterLink, DatePipe, StatusBadge, EmptyState, LoadingState, Pagination, SearchInput],
  templateUrl: './customer-list.html',
})
export class CustomerList {
  private readonly customerService = inject(CustomerService);
  private readonly storeContext = inject(StoreContextService);
  private readonly notifications = inject(NotificationService);

  protected readonly customers = signal<Customer[]>([]);
  protected readonly total = signal(0);
  protected readonly totalPages = signal(1);
  protected readonly page = signal(1);
  protected readonly search = signal('');
  protected readonly loading = signal(true);

  constructor() {
    effect(() => {
      this.search();
      this.page();
      if (this.storeContext.currentStoreId()) void this.load();
      else this.loading.set(false);
    });
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await this.customerService.list({ page: this.page(), search: this.search() });
      this.customers.set(res.data);
      this.total.set(res.meta.total);
      this.totalPages.set(res.meta.totalPages);
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.loading.set(false);
    }
  }

  protected onSearch(value: string): void {
    this.page.set(1);
    this.search.set(value);
  }
}
