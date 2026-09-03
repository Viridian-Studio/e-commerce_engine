import { Component, OnDestroy, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';

@Component({
  selector: 'app-search-input',
  imports: [FormsModule],
  template: `
    <div class="relative">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        class="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-(--color-text-faint)"
      >
        <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
        <path d="m20 20-3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
      <input
        type="search"
        class="input pl-9"
        [placeholder]="placeholder()"
        [ngModel]="value()"
        (ngModelChange)="onInput($event)"
      />
    </div>
  `,
})
export class SearchInput implements OnDestroy {
  readonly placeholder = input('Search…');
  readonly value = input('');
  readonly valueChange = output<string>();

  private readonly input$ = new Subject<string>();
  private readonly sub = this.input$.pipe(debounceTime(300)).subscribe((v) => this.valueChange.emit(v));

  protected onInput(value: string): void {
    this.input$.next(value);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
