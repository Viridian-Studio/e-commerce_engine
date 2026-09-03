import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/api/cart.service';
import { CartItemRow } from '../../shared/components/cart-item-row/cart-item-row';
import { ProductPrice } from '../../shared/components/product-price/product-price';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-cart-page',
  imports: [RouterLink, CartItemRow, ProductPrice, EmptyState, TranslatePipe],
  templateUrl: './cart.html',
})
export class CartPage {
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

  protected checkout(): void {
    void this.router.navigateByUrl('/checkout');
  }
}
