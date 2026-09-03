import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ViridianTestResult {
  connected: boolean;
  message: string;
  warehouseName?: string;
}

/**
 * Integration layer for the Viridian Warehouse system.
 *
 * The warehouse endpoint is resolved from the `VIRIDIAN_WAREHOUSE_URL` env
 * var (the system knows its own warehouse address — the admin UI never asks
 * for it). Authentication is a bearer API key stored per-store in the
 * settings collection under `viridian_warehouse_api_key`.
 */
@Injectable()
export class ViridianService {
  private readonly logger = new Logger(ViridianService.name);
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = (this.config.get<string>('VIRIDIAN_WAREHOUSE_URL') ?? '').replace(/\/$/, '');
  }

  /**
   * Tests the connection to Viridian Warehouse by hitting its `/auth/verify`
   * endpoint with the provided API key. Returns a structured result so the
   * admin UI can show meaningful feedback.
   */
  async testConnection(apiKey: string): Promise<ViridianTestResult> {
    if (!apiKey?.trim()) {
      return { connected: false, message: 'API key is required' };
    }
    if (!this.baseUrl) {
      return {
        connected: false,
        message: 'VIRIDIAN_WAREHOUSE_URL is not configured on the server',
      };
    }

    try {
      const res = await fetch(`${this.baseUrl}/auth/verify`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
        signal: AbortSignal.timeout(10_000),
      });

      if (res.status === 401 || res.status === 403) {
        return { connected: false, message: 'Invalid API key — authentication failed' };
      }
      if (!res.ok) {
        return { connected: false, message: `Warehouse responded with HTTP ${res.status}` };
      }

      const body = (await res.json().catch(() => null)) as { name?: string } | null;
      return {
        connected: true,
        message: 'Connection successful',
        warehouseName: body?.name,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.warn(`Viridian Warehouse connection test failed: ${msg}`);
      return { connected: false, message: `Could not reach warehouse: ${msg}` };
    }
  }
}
