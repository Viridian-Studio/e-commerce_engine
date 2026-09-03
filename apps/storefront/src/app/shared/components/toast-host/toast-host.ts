import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/toast.service';

@Component({
  selector: 'app-toast-host',
  template: `
    <div class="pointer-events-none fixed top-4 right-4 z-[80] flex w-[calc(100vw-2rem)] max-w-80 flex-col gap-2">
      @for (t of toasts.toasts(); track t.id) {
        <div
          class="animate-toast-in pointer-events-auto flex items-start gap-2.5 border bg-(--color-store-surface) p-3 shadow-lg"
          [class]="t.kind === 'error' ? 'border-(--color-store-primary)' : 'border-(--color-store-border)'"
        >
          <p class="flex-1 text-sm text-(--color-store-text)">{{ t.message }}</p>
          <button
            type="button"
            class="text-(--color-store-text-faint) hover:text-(--color-store-text)"
            (click)="toasts.dismiss(t.id)"
            aria-label="Dismiss"
          >
            &times;
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastHost {
  protected readonly toasts = inject(ToastService);
}
