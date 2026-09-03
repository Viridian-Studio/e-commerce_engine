import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CategoryService, type CategoryNode } from '../../core/api/category.service';
import { StoreService } from '../../core/api/store.service';
import { ToastService } from '../../core/toast.service';

const CUSTOMER_CARE = ['Szállítás', 'Visszaküldés', 'Gyakori kérdések', 'Méret táblázat'];
const ABOUT = ['Rólunk', 'Fenntarthatóság', 'Adatvédelem', 'Általános szerződési feltételek'];
const PAYMENT_ICONS = ['VISA', 'MASTERCARD', 'PAYPAL', 'APPLE PAY', 'GPAY'];

@Component({
  selector: 'app-footer',
  imports: [RouterLink, FormsModule],
  templateUrl: './footer.html',
})
export class Footer {
  private readonly categoryService = inject(CategoryService);
  private readonly toast = inject(ToastService);
  protected readonly storeService = inject(StoreService);

  protected readonly shopLinks = signal<CategoryNode[]>([]);
  protected readonly customerCare = CUSTOMER_CARE;
  protected readonly about = ABOUT;
  protected readonly paymentIcons = PAYMENT_ICONS;
  protected readonly year = new Date().getFullYear();

  protected email = '';

  constructor() {
    void this.categoryService.tree().then((tree) => this.shopLinks.set(tree));
  }

  protected subscribe(form: HTMLFormElement): void {
    if (!this.email || !this.email.includes('@')) {
      this.toast.error('Adj meg egy érvényes email címet.');
      return;
    }
    this.toast.success('Feliratkoztál! Üdvözlünk a csapatban.');
    this.email = '';
    form.reset();
  }
}
