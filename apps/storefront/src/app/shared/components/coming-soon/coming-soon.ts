import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-coming-soon',
  imports: [RouterLink],
  template: `
    <div class="container-store flex min-h-[50vh] flex-col items-center justify-center gap-4 py-24 text-center">
      <p class="eyebrow">Hamarosan</p>
      <h1 class="heading-lg">{{ title() }}</h1>
      <p class="max-w-md text-sm text-(--color-store-text-muted)">{{ message() }}</p>
      <a routerLink="/" class="btn-primary mt-2">Vissza a boltba</a>
    </div>
  `,
})
export class ComingSoon {
  readonly title = input('Hamarosan');
  readonly message = input('A webáruház ezen része hamarosan elérhető.');
}
