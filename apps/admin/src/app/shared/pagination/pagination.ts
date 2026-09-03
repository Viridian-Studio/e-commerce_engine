import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  template: `
    @if (totalPages() > 1 || total() > 0) {
      <div
        class="flex flex-col items-center justify-between gap-3 border-t border-(--color-border) px-4 py-3 text-sm sm:flex-row"
      >
        <p class="text-(--color-text-muted)">
          Showing <span class="text-(--color-text)">{{ rangeStart() }}–{{ rangeEnd() }}</span> of
          <span class="text-(--color-text)">{{ total() }}</span>
        </p>
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="icon-btn"
            [disabled]="page() <= 1"
            (click)="pageChange.emit(page() - 1)"
            aria-label="Previous page"
          >
            <svg viewBox="0 0 24 24" fill="none" class="h-4 w-4">
              <path
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m15 18-6-6 6-6"
              />
            </svg>
          </button>
          <span class="px-2 text-(--color-text-muted)">{{ page() }} / {{ totalPages() }}</span>
          <button
            type="button"
            class="icon-btn"
            [disabled]="page() >= totalPages()"
            (click)="pageChange.emit(page() + 1)"
            aria-label="Next page"
          >
            <svg viewBox="0 0 24 24" fill="none" class="h-4 w-4">
              <path
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m9 18 6-6-6-6"
              />
            </svg>
          </button>
        </div>
      </div>
    }
  `,
})
export class Pagination {
  readonly page = input(1);
  readonly limit = input(20);
  readonly total = input(0);
  readonly totalPages = input(1);

  readonly pageChange = output<number>();

  protected readonly rangeStart = computed(() =>
    this.total() === 0 ? 0 : (this.page() - 1) * this.limit() + 1,
  );
  protected readonly rangeEnd = computed(() => Math.min(this.page() * this.limit(), this.total()));
}
