import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  SettingsService,
  type ViridianInventoryItem,
  type ViridianTestResult,
} from '../../core/services/settings.service';
import { StoreContextService } from '../../core/store-context.service';
import { NotificationService } from '../../core/notification.service';
import { ConfirmService } from '../../shared/confirm-dialog/confirm.service';
import { extractErrorMessage } from '../../core/http-error';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { Modal } from '../../shared/modal/modal';

interface SettingRow {
  key: string;
  value: string;
}

const VIRIDIAN_KEY = 'viridian_warehouse_api_key';
const MAINTENANCE_KEY = 'maintenance_enabled';
const MAINTENANCE_MSG_KEY = 'maintenance_message';

@Component({
  selector: 'app-settings-page',
  imports: [FormsModule, EmptyState, Modal],
  templateUrl: './settings-page.html',
})
export class SettingsPage {
  private readonly settingsService = inject(SettingsService);
  private readonly storeContext = inject(StoreContextService);
  private readonly notifications = inject(NotificationService);
  private readonly confirm = inject(ConfirmService);

  protected readonly rows = signal<SettingRow[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);

  protected newKey = '';
  protected newValue = '';

  // Viridian Warehouse connection
  protected readonly viridianModalOpen = signal(false);
  protected readonly viridianConnected = signal(false);
  protected readonly viridianSaving = signal(false);
  protected readonly viridianTesting = signal(false);
  protected readonly viridianTestResult = signal<ViridianTestResult | null>(null);
  protected viridianApiKey = '';

  // Viridian Warehouse import
  protected readonly viridianImportModalOpen = signal(false);
  protected readonly viridianImportLoading = signal(false);
  protected readonly viridianImportSaving = signal(false);
  protected readonly viridianInventory = signal<ViridianInventoryItem[]>([]);
  protected readonly viridianSelectedIds = signal<Set<string>>(new Set());

  // Maintenance mode
  protected readonly maintenanceEnabled = signal(false);
  protected readonly maintenanceSaving = signal(false);
  protected maintenanceMessage = '';

  constructor() {
    effect(() => {
      if (this.storeContext.currentStoreId()) void this.load();
      else this.loading.set(false);
    });
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const all = await this.settingsService.findAll();
      this.rows.set(
        Object.entries(all).map(([key, value]) => ({
          key,
          value: typeof value === 'string' ? value : JSON.stringify(value),
        })),
      );
      // Sync Viridian connection status from stored settings
      this.viridianConnected.set(Boolean(all[VIRIDIAN_KEY]));
      this.viridianApiKey = (all[VIRIDIAN_KEY] as string) ?? '';
      // Sync maintenance mode
      this.maintenanceEnabled.set(all[MAINTENANCE_KEY] === true);
      this.maintenanceMessage = (all[MAINTENANCE_MSG_KEY] as string) ?? '';
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.loading.set(false);
    }
  }

  protected openViridianModal(): void {
    this.viridianTestResult.set(null);
    this.viridianModalOpen.set(true);
  }

  /**
   * Tests the connection first, and only saves the API key if the test
   * passes — so a wrong key never gets persisted as "connected".
   */
  protected async saveViridianConnection(): Promise<void> {
    if (!this.viridianApiKey.trim()) {
      this.notifications.error('API key is required');
      return;
    }
    this.viridianSaving.set(true);
    this.viridianTestResult.set(null);
    try {
      const result = await this.settingsService.testViridian(this.viridianApiKey.trim());
      this.viridianTestResult.set(result);
      if (!result.connected) {
        this.notifications.error(result.message);
        return;
      }
      await this.settingsService.upsert(VIRIDIAN_KEY, this.viridianApiKey.trim());
      this.viridianConnected.set(true);
      this.viridianModalOpen.set(false);
      this.notifications.success(
        result.warehouseName ? `Connected to ${result.warehouseName}` : 'Viridian Warehouse connected',
      );
      await this.load();
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.viridianSaving.set(false);
    }
  }

  protected async openViridianImportModal(): Promise<void> {
    this.viridianImportModalOpen.set(true);
    this.viridianSelectedIds.set(new Set());
    this.viridianImportLoading.set(true);
    try {
      const items = await this.settingsService.listViridianInventory(this.viridianApiKey.trim());
      this.viridianInventory.set(items);
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
      this.viridianInventory.set([]);
    } finally {
      this.viridianImportLoading.set(false);
    }
  }

  protected toggleViridianItem(id: string): void {
    const next = new Set(this.viridianSelectedIds());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.viridianSelectedIds.set(next);
  }

  protected async importViridianSelection(): Promise<void> {
    const itemIds = Array.from(this.viridianSelectedIds());
    if (itemIds.length === 0) return;
    this.viridianImportSaving.set(true);
    try {
      const result = await this.settingsService.importViridianItems(this.viridianApiKey.trim(), itemIds);
      this.viridianImportModalOpen.set(false);
      if (result.skipped > 0) {
        this.notifications.success(
          `${result.imported} termék importálva, ${result.skipped} kihagyva (már létező cikkszám).`,
        );
      } else {
        this.notifications.success(`${result.imported} termék importálva.`);
      }
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.viridianImportSaving.set(false);
    }
  }

  protected async disconnectViridian(): Promise<void> {
    const ok = await this.confirm.confirm({
      title: 'Disconnect Viridian Warehouse?',
      confirmLabel: 'Disconnect',
      danger: true,
    });
    if (!ok) return;
    try {
      await this.settingsService.remove(VIRIDIAN_KEY);
      this.viridianConnected.set(false);
      this.viridianApiKey = '';
      this.notifications.success('Viridian Warehouse disconnected');
      await this.load();
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    }
  }

  protected async toggleMaintenance(): Promise<void> {
    const next = !this.maintenanceEnabled();
    if (next) {
      const ok = await this.confirm.confirm({
        title: 'Enable maintenance mode?',
        message: 'The storefront will show a maintenance page to all visitors.',
        confirmLabel: 'Enable',
        danger: true,
      });
      if (!ok) return;
    }
    this.maintenanceSaving.set(true);
    try {
      await this.settingsService.upsert(MAINTENANCE_KEY, next);
      if (this.maintenanceMessage.trim()) {
        await this.settingsService.upsert(MAINTENANCE_MSG_KEY, this.maintenanceMessage.trim());
      }
      this.maintenanceEnabled.set(next);
      this.notifications.success(next ? 'Maintenance mode enabled' : 'Storefront is back online');
      await this.load();
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.maintenanceSaving.set(false);
    }
  }

  protected async saveMaintenanceMessage(): Promise<void> {
    try {
      await this.settingsService.upsert(MAINTENANCE_MSG_KEY, this.maintenanceMessage.trim());
      this.notifications.success('Maintenance message saved');
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    }
  }

  protected async addSetting(): Promise<void> {
    if (!this.newKey.trim()) return;
    this.saving.set(true);
    try {
      await this.settingsService.upsert(this.newKey.trim(), this.parseValue(this.newValue));
      this.newKey = '';
      this.newValue = '';
      this.notifications.success('Setting saved');
      await this.load();
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.saving.set(false);
    }
  }

  protected async updateRow(row: SettingRow): Promise<void> {
    try {
      await this.settingsService.upsert(row.key, this.parseValue(row.value));
      this.notifications.success('Setting saved');
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    }
  }

  protected async removeRow(row: SettingRow): Promise<void> {
    const ok = await this.confirm.confirm({ title: `Remove "${row.key}"?`, confirmLabel: 'Remove', danger: true });
    if (!ok) return;
    try {
      await this.settingsService.remove(row.key);
      this.notifications.success('Setting removed');
      await this.load();
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    }
  }

  private parseValue(raw: string): unknown {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
}
