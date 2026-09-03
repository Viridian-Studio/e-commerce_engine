import { Component, inject } from '@angular/core';
import { NotificationService } from '../../core/notification.service';

const ICON_BY_KIND: Record<string, string> = {
  success: 'M5 13l4 4L19 7',
  error: 'M6 6l12 12M18 6 6 18',
  info: 'M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
};

const CLASS_BY_KIND: Record<string, string> = {
  success: 'border-(--color-success) text-(--color-success)',
  error: 'border-(--color-danger) text-(--color-danger)',
  info: 'border-(--color-info) text-(--color-info)',
};

@Component({
  selector: 'app-toast-host',
  template: `
    <div class="pointer-events-none fixed top-4 right-4 z-[70] flex w-80 flex-col gap-2">
      @for (n of notifications.notifications(); track n.id) {
        <div
          class="card pointer-events-auto flex items-start gap-2.5 border-l-2 p-3 shadow-lg"
          [class]="classFor(n.kind)"
        >
          <svg viewBox="0 0 24 24" fill="none" class="mt-0.5 h-4 w-4 shrink-0">
            <path
              [attr.d]="iconFor(n.kind)"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <p class="flex-1 text-sm text-(--color-text)">{{ n.message }}</p>
          <button
            type="button"
            class="text-(--color-text-faint) hover:text-(--color-text)"
            (click)="notifications.dismiss(n.id)"
            aria-label="Dismiss"
          >
            <svg viewBox="0 0 24 24" fill="none" class="h-3.5 w-3.5">
              <path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastHost {
  protected readonly notifications = inject(NotificationService);

  protected iconFor(kind: string): string {
    return ICON_BY_KIND[kind] ?? ICON_BY_KIND['info'];
  }

  protected classFor(kind: string): string {
    return CLASS_BY_KIND[kind] ?? CLASS_BY_KIND['info'];
  }
}
