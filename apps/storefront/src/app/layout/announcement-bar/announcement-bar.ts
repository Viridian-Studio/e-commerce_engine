import { Component, inject } from '@angular/core';
import { StoreService } from '../../core/api/store.service';

/**
 * Optional announcement bar rendered above the header. Driven entirely by
 * the store's theme.announcement config — if `enabled` is false or `text`
 * is empty, nothing renders.
 */
@Component({
  selector: 'app-announcement-bar',
  template: `
    @if (visible()) {
      <div
        class="w-full py-2 text-center text-xs font-medium tracking-wide"
        [style.background]="background()"
        [style.color]="color()"
      >
        {{ text() }}
      </div>
    }
  `,
})
export class AnnouncementBar {
  private readonly storeService = inject(StoreService);

  protected readonly announcement = () => this.storeService.store()?.theme?.announcement;

  protected readonly visible = () => !!this.announcement()?.enabled && !!this.announcement()?.text?.trim();
  protected readonly text = () => this.announcement()?.text ?? '';
  protected readonly color = () => this.announcement()?.color || '#ffffff';
  protected readonly background = () => this.announcement()?.background || 'var(--color-store-primary)';
}
