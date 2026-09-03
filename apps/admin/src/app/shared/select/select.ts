import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-select',
  imports: [FormsModule],
  template: `
    <select class="input appearance-none pr-8" [ngModel]="value()" (ngModelChange)="valueChange.emit($event)">
      @if (placeholder()) {
        <option value="">{{ placeholder() }}</option>
      }
      @for (opt of options(); track opt.value) {
        <option [value]="opt.value">{{ opt.label }}</option>
      }
    </select>
  `,
})
export class Select {
  readonly options = input<SelectOption[]>([]);
  readonly value = input('');
  readonly placeholder = input('');
  readonly valueChange = output<string>();
}
