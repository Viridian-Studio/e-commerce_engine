import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  template: `
    @if (totalPages() > 1) {
      <nav class="mt-10 flex items-center justify-center gap-1.5" aria-label="Pagination">
        <button
          type="button"
          class="icon-btn"
          [disabled]="page() <= 1"
          (click)="pageChanged.emit(page() - 1)"
          aria-label="Előző oldal"
        >
          &larr;
        </button>
        @for (p of pages(); track p) {
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center text-sm transition-colors"
            [class]="p === page() ? 'bg-(--color-store-primary) text-white' : 'text-(--color-store-text-muted) hover:text-(--color-store-text)'"
            (click)="pageChanged.emit(p)"
          >
            {{ p }}
          </button>
        }
        <button
          type="button"
          class="icon-btn"
          [disabled]="page() >= totalPages()"
          (click)="pageChanged.emit(page() + 1)"
          aria-label="Következő oldal"
        >
          &rarr;
        </button>
      </nav>
    }
  `,
})
export class Pagination {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly pageChanged = output<number>();

  protected readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));
}
