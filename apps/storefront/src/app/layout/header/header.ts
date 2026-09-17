import { Component, computed, effect, inject, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CategoryService, type CategoryNode } from '../../core/api/category.service';
import { CartService } from '../../core/api/cart.service';
import { AuthService } from '../../core/api/auth.service';
import { StoreService } from '../../core/api/store.service';
import { WishlistService } from '../../core/wishlist.service';
import { MobileMenu } from '../mobile-menu/mobile-menu';
import { LanguageSwitcher } from './language-switcher/language-switcher';
import { CurrencySwitcher } from './currency-switcher/currency-switcher';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { TemplateService } from '../../core/theme/template.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, UpperCasePipe, FormsModule, MobileMenu, LanguageSwitcher, CurrencySwitcher, TranslatePipe],
  templateUrl: './header.html',
  host: { '(document:keydown.escape)': 'categoryPanelOpen.set(false)' },
})
export class Header {
  private readonly categoryService = inject(CategoryService);
  private readonly router = inject(Router);
  private readonly templates = inject(TemplateService);
  protected readonly cart = inject(CartService);
  protected readonly auth = inject(AuthService);
  protected readonly storeService = inject(StoreService);
  protected readonly wishlist = inject(WishlistService);

  protected readonly categoryTree = signal<CategoryNode[]>([]);
  protected readonly mobileMenuOpen = signal(false);

  /** `search` swaps the centred nav for a full-width search field plus a
   *  category bar underneath — the catalog and megastore templates lead with
   *  search, the editorial one with navigation. */
  protected readonly layout = this.templates.layout;
  protected readonly searchLed = computed(() => this.layout().header === 'search');
  protected readonly query = signal('');
  protected readonly categoryPanelOpen = signal(false);

  protected readonly customerInitial = computed(() => {
    const c = this.auth.customer();
    return c ? (c.firstName.charAt(0) || c.email.charAt(0)).toUpperCase() : '';
  });

  protected readonly logoWords = computed(() => {
    const name = this.storeService.store()?.name ?? 'Store';
    const parts = name.trim().split(/\s+/);
    const accent = parts.pop() ?? '';
    return { main: parts.join(' ') || accent, accent: parts.length ? accent : '' };
  });

  protected submitSearch(): void {
    const q = this.query().trim();
    void this.router.navigate(['/search'], { queryParams: q ? { q } : {} });
    this.categoryPanelOpen.set(false);
  }

  protected readonly cartBump = signal(false);
  private previousItemCount = 0;

  constructor() {
    void this.categoryService.tree().then((tree) => this.categoryTree.set(tree));

    effect(() => {
      const count = this.cart.itemCount();
      if (count > this.previousItemCount) {
        this.cartBump.set(true);
        setTimeout(() => this.cartBump.set(false), 350);
      }
      this.previousItemCount = count;
    });
  }
}
