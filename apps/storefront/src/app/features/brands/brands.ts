import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Brand } from '@ecom/types';
import { BrandService } from '../../core/api/brand.service';
import { Breadcrumb, type BreadcrumbItem } from '../../shared/components/breadcrumb/breadcrumb';
import { EmptyState } from '../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-brands-page',
  imports: [RouterLink, Breadcrumb, EmptyState],
  template: `
    <section class="section-dark py-10">
      <div class="container-store">
        <app-breadcrumb [items]="breadcrumbs" />
        <h1 class="heading-xl mt-4">Márkák</h1>

        @if (brands().length === 0) {
          <app-empty-state title="Még nincsenek márkák" />
        } @else {
          <div class="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            @for (brand of brands(); track brand._id) {
              <a [routerLink]="['/brand', brand.slug]" class="group relative block aspect-square overflow-hidden bg-(--color-store-light)">
                @if (brand.image) {
                  <img [src]="brand.image" [alt]="brand.name" class="h-full w-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105" />
                }
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
                <p class="absolute bottom-3 left-3 text-sm font-bold tracking-wide text-white uppercase">{{ brand.name }}</p>
              </a>
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class BrandsPage {
  private readonly brandService = inject(BrandService);
  protected readonly brands = signal<Brand[]>([]);
  protected readonly breadcrumbs: BreadcrumbItem[] = [{ label: 'Kezdőlap', url: '/' }, { label: 'Márkák' }];

  constructor() {
    void this.brandService.list().then((b) => this.brands.set(b));
  }
}
