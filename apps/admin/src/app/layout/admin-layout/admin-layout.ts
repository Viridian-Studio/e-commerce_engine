import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';
import { StoreContextService } from '../../core/store-context.service';

const COLLAPSE_KEY = 'ecom_admin_sidebar_collapsed';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, Sidebar, Topbar],
  template: `
    <div class="flex h-screen w-screen overflow-hidden bg-(--color-bg)">
      <app-sidebar [collapsed]="collapsed()" (toggle)="toggleCollapsed()" />
      <div class="flex min-w-0 flex-1 flex-col">
        <app-topbar />
        <main class="flex-1 overflow-y-auto">
          <div class="mx-auto max-w-7xl px-6 py-6">
            <div class="animate-fade-in-up">
              <router-outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
})
export class AdminLayout {
  private readonly storeContext = inject(StoreContextService);

  protected readonly collapsed = signal(localStorage.getItem(COLLAPSE_KEY) === '1');

  constructor() {
    void this.storeContext.loadStores();
  }

  protected toggleCollapsed(): void {
    const next = !this.collapsed();
    this.collapsed.set(next);
    localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
  }
}
