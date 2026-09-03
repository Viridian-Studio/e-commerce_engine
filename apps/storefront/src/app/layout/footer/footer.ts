import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CategoryService, type CategoryNode } from '../../core/api/category.service';
import { StoreService } from '../../core/api/store.service';
import { ToastService } from '../../core/toast.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

const CUSTOMER_CARE: Record<'hu' | 'en', string[]> = {
  hu: ['Szállítás', 'Visszaküldés', 'Gyakori kérdések', 'Méret táblázat'],
  en: ['Shipping & Delivery', 'Returns', 'FAQ', 'Size Guide'],
};
const ABOUT: Record<'hu' | 'en', string[]> = {
  hu: ['Rólunk', 'Fenntarthatóság', 'Adatvédelem', 'Általános szerződési feltételek'],
  en: ['Our Story', 'Sustainability', 'Privacy Policy', 'Terms & Conditions'],
};
const PAYMENT_ICONS = ['VISA', 'MASTERCARD', 'PAYPAL', 'APPLE PAY', 'GPAY'];

@Component({
  selector: 'app-footer',
  imports: [RouterLink, FormsModule, TranslatePipe],
  templateUrl: './footer.html',
})
export class Footer {
  private readonly categoryService = inject(CategoryService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);
  protected readonly storeService = inject(StoreService);

  protected readonly shopLinks = signal<CategoryNode[]>([]);
  protected readonly customerCare = computed(() => CUSTOMER_CARE[this.i18n.lang()]);
  protected readonly about = computed(() => ABOUT[this.i18n.lang()]);
  protected readonly paymentIcons = PAYMENT_ICONS;
  protected readonly year = new Date().getFullYear();

  protected email = '';

  constructor() {
    void this.categoryService.tree().then((tree) => this.shopLinks.set(tree));
  }

  protected subscribe(form: HTMLFormElement): void {
    if (!this.email || !this.email.includes('@')) {
      this.toast.error(this.i18n.lang() === 'hu' ? 'Adj meg egy érvényes email címet.' : 'Enter a valid email address.');
      return;
    }
    this.toast.success(
      this.i18n.lang() === 'hu' ? 'Feliratkoztál! Üdvözlünk a csapatban.' : 'You are on the list. Welcome to the movement.',
    );
    this.email = '';
    form.reset();
  }
}
