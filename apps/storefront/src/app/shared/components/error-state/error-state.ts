import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  template: `
    <div class="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <div class="flex h-12 w-12 items-center justify-center rounded-full border border-(--color-store-primary)/40">
        <svg viewBox="0 0 24 24" fill="none" class="h-5 w-5 text-(--color-store-primary)">
          <path
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      </div>
      <h3 class="heading-md">{{ title() }}</h3>
      <p class="max-w-sm text-sm text-(--color-store-text-muted)">{{ message() }}</p>
      @if (retryable()) {
        <button type="button" class="btn-outline mt-1" (click)="retry.emit()">Próbáld újra</button>
      }
    </div>
  `,
})
export class ErrorState {
  readonly title = input('Hiba történt');
  readonly message = input('Ezt most nem sikerült betölteni. Kérjük, próbáld újra.');
  readonly retryable = input(true);
  readonly retry = output<void>();
}
