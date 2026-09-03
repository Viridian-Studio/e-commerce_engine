import { Component, computed, effect, inject, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CategoryService, type CategoryNode } from '../../core/api/category.service';
import { CartService } from '../../core/api/cart.service';
import { StoreService } from '../../core/api/store.service';
import { MobileMenu } from '../mobile-menu/mobile-menu';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, UpperCasePipe, MobileMenu],
  templateUrl: './header.html',
})
export class Header {
  private readonly categoryService = inject(CategoryService);
  protected readonly cart = inject(CartService);
  protected readonly storeService = inject(StoreService);

  protected readonly categoryTree = signal<CategoryNode[]>([]);
  protected readonly mobileMenuOpen = signal(false);

  protected readonly logoWords = computed(() => {
    const name = this.storeService.store()?.name ?? 'Store';
    const parts = name.trim().split(/\s+/);
    const accent = parts.pop() ?? '';
    return { main: parts.join(' ') || accent, accent: parts.length ? accent : '' };
  });

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
