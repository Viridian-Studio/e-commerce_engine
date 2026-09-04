import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface ViridianTestResult {
  connected: boolean;
  message: string;
  warehouseName?: string;
}

export interface ViridianInventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string | null;
  quantity: number;
  availableQuantity: number;
  unit: string;
}

export interface ViridianImportResult {
  imported: number;
  skipped: number;
  skippedSkus: string[];
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly http = inject(HttpClient);
  private readonly basePath = '/api/admin/settings';

  findAll(): Promise<Record<string, unknown>> {
    return firstValueFrom(this.http.get<Record<string, unknown>>(this.basePath));
  }

  upsert(key: string, value: unknown): Promise<unknown> {
    return firstValueFrom(this.http.post(this.basePath, { key, value }));
  }

  remove(key: string): Promise<{ key: string }> {
    return firstValueFrom(this.http.delete<{ key: string }>(`${this.basePath}/${key}`));
  }

  testViridian(apiKey: string): Promise<ViridianTestResult> {
    return firstValueFrom(
      this.http.post<ViridianTestResult>('/api/admin/integrations/viridian/test', { apiKey }),
    );
  }

  listViridianInventory(apiKey: string): Promise<ViridianInventoryItem[]> {
    return firstValueFrom(
      this.http.post<ViridianInventoryItem[]>('/api/admin/integrations/viridian/inventory', { apiKey }),
    );
  }

  importViridianItems(apiKey: string, itemIds: string[]): Promise<ViridianImportResult> {
    return firstValueFrom(
      this.http.post<ViridianImportResult>('/api/admin/integrations/viridian/import', { apiKey, itemIds }),
    );
  }
}
