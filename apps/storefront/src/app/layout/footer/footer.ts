import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CategoryService, type CategoryNode } from '../../core/api/category.service';
import { StoreService } from '../../core/api/store.service';
import { ToastService } from '../../core/toast.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { CUSTOMER_CARE_SLUGS, ABOUT_SLUGS, INFO_PAGES } from '../../features/info/info-data';

interface FooterLink {
  slug: string;
  label: string;
}

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
  protected readonly customerCare = computed<FooterLink[]>(() =>
    CUSTOMER_CARE_SLUGS.map((slug) => ({ slug, label: INFO_PAGES[slug]?.content[this.i18n.lang()].title ?? slug })),
  );
  protected readonly about = computed<FooterLink[]>(() =>
    ABOUT_SLUGS.map((slug) => ({ slug, label: INFO_PAGES[slug]?.content[this.i18n.lang()].title ?? slug })),
  );
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
