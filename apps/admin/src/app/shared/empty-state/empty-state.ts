import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div
        class="flex h-12 w-12 items-center justify-center rounded-full bg-(--color-surface-2) text-(--color-text-faint)"
      >
        <svg viewBox="0 0 24 24" fill="none" class="h-6 w-6">
          <path
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4 7h16M4 12h16M4 17h10"
          />
        </svg>
      </div>
      <div>
        <p class="text-sm font-medium text-(--color-text)">{{ title() }}</p>
        @if (message()) {
          <p class="mt-1 text-sm text-(--color-text-muted)">{{ message() }}</p>
        }
      </div>
      <ng-content />
    </div>
  `,
})
export class EmptyState {
  readonly title = input('Nothing here yet');
  readonly message = input<string>('');
}
