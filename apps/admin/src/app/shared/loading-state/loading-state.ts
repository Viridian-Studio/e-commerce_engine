import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-state',
  template: `
    @if (rows() > 0) {
      <div class="divide-y divide-(--color-border)">
        @for (r of rowArray(); track r) {
          <div class="flex items-center gap-4 px-4 py-3.5">
            <div class="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-(--color-surface-2)"></div>
            <div class="flex-1 space-y-2">
              <div class="h-3 w-1/3 animate-pulse rounded bg-(--color-surface-2)"></div>
              <div class="h-2.5 w-1/5 animate-pulse rounded bg-(--color-surface-2)"></div>
            </div>
          </div>
        }
      </div>
    } @else {
      <div class="flex items-center justify-center gap-2 py-16 text-sm text-(--color-text-muted)">
        <svg viewBox="0 0 24 24" fill="none" class="h-4 w-4 animate-spin">
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-opacity="0.25"
          />
          <path
            d="M21 12a9 9 0 0 0-9-9"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
          />
        </svg>
        Loading…
      </div>
    }
  `,
})
export class LoadingState {
  readonly rows = input(0);

  protected get rowArray(): () => number[] {
    return () => Array.from({ length: this.rows() }, (_, i) => i);
  }
}
