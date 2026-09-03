import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../core/api/cart.service';
import { ProductPrice } from '../../shared/components/product-price/product-price';
import { CartItemRow } from '../../shared/components/cart-item-row/cart-item-row';
import { EmptyState } from '../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-cart-drawer',
  imports: [ProductPrice, CartItemRow, EmptyState],
  templateUrl: './cart-drawer.html',
})
export class CartDrawer {
  protected readonly cart = inject(CartService);
  private readonly router = inject(Router);

  protected updateQuantity(itemId: string | undefined, quantity: number): void {
    if (!itemId) return;
    void this.cart.updateItem(itemId, quantity);
  }

  protected removeItem(itemId: string | undefined): void {
    if (!itemId) return;
    void this.cart.removeItem(itemId);
  }

  protected goToCheckout(): void {
    this.cart.closeDrawer();
    void this.router.navigateByUrl('/checkout');
  }
}
