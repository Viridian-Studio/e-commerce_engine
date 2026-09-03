import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../core/services/settings.service';
import { StoreContextService } from '../../core/store-context.service';
import { NotificationService } from '../../core/notification.service';
import { ConfirmService } from '../../shared/confirm-dialog/confirm.service';
import { extractErrorMessage } from '../../core/http-error';
import { EmptyState } from '../../shared/empty-state/empty-state';

interface SettingRow {
  key: string;
  value: string;
}

@Component({
  selector: 'app-settings-page',
  imports: [FormsModule, EmptyState],
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
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.loading.set(false);
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
