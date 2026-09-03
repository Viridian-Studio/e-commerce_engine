import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { DashboardStats } from '@ecom/types';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  getStats(): Promise<DashboardStats> {
    return firstValueFrom(this.http.get<DashboardStats>('/api/admin/dashboard'));
  }
}
