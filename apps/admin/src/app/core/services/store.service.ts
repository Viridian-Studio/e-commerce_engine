import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { Store } from '@ecom/types';

@Injectable({ providedIn: 'root' })
export class StoreService {
  private readonly http = inject(HttpClient);
  private readonly basePath = '/api/admin/stores';

  list(): Promise<Store[]> {
    return firstValueFrom(this.http.get<Store[]>(this.basePath));
  }

  get(id: string): Promise<Store> {
    return firstValueFrom(this.http.get<Store>(`${this.basePath}/${id}`));
  }

  create(dto: Record<string, unknown>): Promise<Store> {
    return firstValueFrom(this.http.post<Store>(this.basePath, dto));
  }

  update(id: string, dto: Record<string, unknown>): Promise<Store> {
    return firstValueFrom(this.http.patch<Store>(`${this.basePath}/${id}`, dto));
  }

  remove(id: string): Promise<{ id: string }> {
    return firstValueFrom(this.http.delete<{ id: string }>(`${this.basePath}/${id}`));
  }
}
