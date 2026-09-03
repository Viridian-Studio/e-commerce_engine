import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <div class="flex h-12 w-12 items-center justify-center rounded-full border border-(--color-store-border)">
        <svg viewBox="0 0 24 24" fill="none" class="h-5 w-5 text-(--color-store-text-muted)">
          <path
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3 7h18M6 7l1 13h10l1-13M9 7V5a3 3 0 0 1 6 0v2"
          />
        </svg>
      </div>
      <h3 class="heading-md">{{ title() }}</h3>
      @if (message()) {
        <p class="max-w-sm text-sm text-(--color-store-text-muted)">{{ message() }}</p>
      }
      <ng-content />
    </div>
  `,
})
export class EmptyState {
  readonly title = input('Még nincs itt semmi');
  readonly message = input<string>('');
}
