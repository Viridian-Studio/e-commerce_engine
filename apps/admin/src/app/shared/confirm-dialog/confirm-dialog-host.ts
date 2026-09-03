import { Component, inject } from '@angular/core';
import { ConfirmService } from './confirm.service';

@Component({
  selector: 'app-confirm-dialog-host',
  template: `
    @if (confirm.state(); as state) {
      <div class="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60" (click)="confirm.resolve(false)"></div>
        <div class="card relative w-full max-w-sm p-5 shadow-2xl">
          <h2 class="text-sm font-semibold text-(--color-text)">{{ state.title }}</h2>
          @if (state.message) {
            <p class="mt-2 text-sm text-(--color-text-muted)">{{ state.message }}</p>
          }
          <div class="mt-5 flex justify-end gap-2">
            <button type="button" class="btn-secondary" (click)="confirm.resolve(false)">
              {{ state.cancelLabel ?? 'Cancel' }}
            </button>
            <button
              type="button"
              [class]="state.danger ? 'btn-danger' : 'btn-primary'"
              (click)="confirm.resolve(true)"
            >
              {{ state.confirmLabel ?? 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogHost {
  protected readonly confirm = inject(ConfirmService);
}
