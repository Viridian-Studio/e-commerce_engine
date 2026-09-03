import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import type {
  Attribute,
  Brand,
  Category,
  Collection,
  ImageRef,
  Product,
  ProductStatus,
  ProductVariant,
  VariantStatus,
} from '@ecom/types';
import { ProductService } from '../../../core/services/product.service';
import { VariantService } from '../../../core/services/variant.service';
import { BrandService } from '../../../core/services/brand.service';
import { CategoryService } from '../../../core/services/category.service';
import { CollectionService } from '../../../core/services/collection.service';
import { AttributeService } from '../../../core/services/attribute.service';
import { StoreContextService } from '../../../core/store-context.service';
import { NotificationService } from '../../../core/notification.service';
import { ConfirmService } from '../../../shared/confirm-dialog/confirm.service';
import { extractErrorMessage } from '../../../core/http-error';
import { ImageListEditor } from '../../../shared/image-list-editor/image-list-editor';
import { PriceInput } from '../../../shared/price-input/price-input';
import { Modal } from '../../../shared/modal/modal';
import { StatusBadge } from '../../../shared/status-badge/status-badge';
import { EmptyState } from '../../../shared/empty-state/empty-state';

type Tab = 'general' | 'pricing' | 'images' | 'variants' | 'seo';

interface ProductForm {
  name: string;
  slug: string;
  description: string;
  status: ProductStatus;
  brandId: string;
  categoryIds: string[];
  collectionIds: string[];
  images: ImageRef[];
  basePrice: number | null;
  compareAtPrice: number | null;
  currency: string;
  seo: { metaTitle: string; metaDescription: string; slug: string; keywords: string };
}

interface VariantForm {
  sku: string;
  name: string;
  price: number | null;
  compareAtPrice: number | null;
  currency: string;
  stock: number;
  status: VariantStatus;
  images: ImageRef[];
  attributes: { attributeSlug: string; value: string }[];
}

function emptyForm(currency: string): ProductForm {
  return {
    name: '',
    slug: '',
    description: '',
    status: 'draft' as ProductStatus,
    brandId: '',
    categoryIds: [],
    collectionIds: [],
    images: [],
    basePrice: null,
    compareAtPrice: null,
    currency,
    seo: { metaTitle: '', metaDescription: '', slug: '', keywords: '' },
  };
}

function emptyVariantForm(currency: string): VariantForm {
  return {
    sku: '',
    name: '',
    price: null,
    compareAtPrice: null,
    currency,
    stock: 0,
    status: 'active' as VariantStatus,
    images: [],
    attributes: [],
  };
}

@Component({
  selector: 'app-product-editor',
  imports: [
    FormsModule,
    RouterLink,
    DecimalPipe,
    ImageListEditor,
    PriceInput,
    Modal,
    StatusBadge,
    EmptyState,
  ],
  templateUrl: './product-editor.html',
})
export class ProductEditor {
  private readonly productService = inject(ProductService);
  private readonly variantService = inject(VariantService);
  private readonly brandService = inject(BrandService);
  private readonly categoryService = inject(CategoryService);
  private readonly collectionService = inject(CollectionService);
  private readonly attributeService = inject(AttributeService);
  private readonly storeContext = inject(StoreContextService);
  private readonly notifications = inject(NotificationService);
  private readonly confirm = inject(ConfirmService);
  private readonly router = inject(Router);

  readonly id = input<string>();

  protected readonly isNew = computed(() => !this.id());
  protected readonly tab = signal<Tab>('general');
  protected readonly tabs: { id: Tab; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'images', label: 'Images' },
    { id: 'variants', label: 'Variants' },
    { id: 'seo', label: 'SEO' },
  ];
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);

  protected readonly product = signal<Product | null>(null);
  protected readonly variants = signal<ProductVariant[]>([]);
  protected readonly brands = signal<Brand[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly collections = signal<Collection[]>([]);
  protected readonly attributes = signal<Attribute[]>([]);

  protected form: ProductForm = emptyForm('USD');

  protected readonly variantModalOpen = signal(false);
  protected readonly editingVariantId = signal<string | null>(null);
  protected variantForm: VariantForm = emptyVariantForm('USD');

  constructor() {
    effect(() => {
      const storeId = this.storeContext.currentStoreId();
      const id = this.id();
      if (!storeId) return;
      void this.loadReferenceData();
      if (id) void this.loadProduct(id);
    });
  }

  private async loadReferenceData(): Promise<void> {
    const [brands, categories, collections, attributes] = await Promise.all([
      this.brandService.listAll(),
      this.categoryService.tree(),
      this.collectionService.listAll(),
      this.attributeService.listAll(),
    ]);
    this.brands.set(brands);
    this.categories.set(categories);
    this.collections.set(collections);
    this.attributes.set(attributes);
    if (this.isNew()) {
      const store = this.storeContext.currentStore();
      if (store) this.form = emptyForm(store.currency);
    }
  }

  private async loadProduct(id: string): Promise<void> {
    this.loading.set(true);
    try {
      const product = await this.productService.get(id);
      this.product.set(product);
      this.variants.set(product.variants ?? []);
      this.form = {
        name: product.name,
        slug: product.slug,
        description: product.description ?? '',
        status: product.status,
        brandId: product.brandId ?? '',
        categoryIds: [...product.categoryIds],
        collectionIds: [...product.collectionIds],
        images: [...product.images],
        basePrice: product.basePrice,
        compareAtPrice: product.compareAtPrice ?? null,
        currency: product.currency,
        seo: {
          metaTitle: product.seo?.metaTitle ?? '',
          metaDescription: product.seo?.metaDescription ?? '',
          slug: product.seo?.slug ?? '',
          keywords: (product.seo?.keywords ?? []).join(', '),
        },
      };
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.loading.set(false);
    }
  }

  protected toggleCategory(id: string): void {
    const list = this.form.categoryIds;
    this.form.categoryIds = list.includes(id) ? list.filter((c) => c !== id) : [...list, id];
  }

  protected toggleCollection(id: string): void {
    const list = this.form.collectionIds;
    this.form.collectionIds = list.includes(id) ? list.filter((c) => c !== id) : [...list, id];
  }

  protected async save(): Promise<void> {
    if (!this.form.name.trim() || this.form.basePrice === null) {
      this.notifications.error('Name and base price are required');
      return;
    }
    this.saving.set(true);
    try {
      const dto = {
        name: this.form.name,
        slug: this.form.slug || undefined,
        description: this.form.description || undefined,
        status: this.form.status,
        brandId: this.form.brandId || null,
        categoryIds: this.form.categoryIds,
        collectionIds: this.form.collectionIds,
        images: this.form.images,
        basePrice: this.form.basePrice,
        compareAtPrice: this.form.compareAtPrice,
        currency: this.form.currency,
        seo: {
          metaTitle: this.form.seo.metaTitle || undefined,
          metaDescription: this.form.seo.metaDescription || undefined,
          slug: this.form.seo.slug || undefined,
          keywords: this.form.seo.keywords
            ? this.form.seo.keywords.split(',').map((k) => k.trim()).filter(Boolean)
            : [],
        },
      };
      if (this.isNew()) {
        const created = await this.productService.create(dto);
        this.notifications.success('Product created');
        await this.router.navigate(['/products', created._id, 'edit']);
      } else {
        const updated = await this.productService.update(this.id()!, dto);
        this.product.set(updated);
        this.notifications.success('Product saved');
      }
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.saving.set(false);
    }
  }

  protected async deleteProduct(): Promise<void> {
    const product = this.product();
    if (!product) return;
    const ok = await this.confirm.confirm({
      title: `Delete "${product.name}"?`,
      message: 'This will also delete all of its variants. This cannot be undone.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    await this.productService.remove(product._id);
    this.notifications.success('Product deleted');
    await this.router.navigateByUrl('/products');
  }

  // --- Variants ---

  protected openNewVariant(): void {
    this.editingVariantId.set(null);
    this.variantForm = emptyVariantForm(this.form.currency);
    this.variantModalOpen.set(true);
  }

  protected openEditVariant(variant: ProductVariant): void {
    this.editingVariantId.set(variant._id);
    this.variantForm = {
      sku: variant.sku,
      name: variant.name ?? '',
      price: variant.price,
      compareAtPrice: variant.compareAtPrice ?? null,
      currency: variant.currency,
      stock: variant.stock,
      status: variant.status,
      images: [...variant.images],
      attributes: variant.attributes.map((a) => ({ ...a })),
    };
    this.variantModalOpen.set(true);
  }

  protected addAttributeRow(): void {
    this.variantForm.attributes = [...this.variantForm.attributes, { attributeSlug: '', value: '' }];
  }

  protected removeAttributeRow(index: number): void {
    this.variantForm.attributes = this.variantForm.attributes.filter((_, i) => i !== index);
  }

  protected async saveVariant(): Promise<void> {
    const productId = this.id();
    if (!productId || !this.variantForm.sku.trim() || this.variantForm.price === null) {
      this.notifications.error('SKU and price are required');
      return;
    }
    const dto = {
      sku: this.variantForm.sku,
      name: this.variantForm.name || undefined,
      price: this.variantForm.price,
      compareAtPrice: this.variantForm.compareAtPrice,
      currency: this.variantForm.currency,
      stock: this.variantForm.stock,
      status: this.variantForm.status,
      images: this.variantForm.images,
      attributes: this.variantForm.attributes.filter((a) => a.attributeSlug && a.value),
    };
    try {
      const editingId = this.editingVariantId();
      if (editingId) {
        await this.variantService.update(editingId, dto);
      } else {
        await this.variantService.create(productId, dto);
      }
      this.notifications.success('Variant saved');
      this.variantModalOpen.set(false);
      this.variants.set(await this.variantService.listByProduct(productId));
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    }
  }

  protected async deleteVariant(variant: ProductVariant): Promise<void> {
    const ok = await this.confirm.confirm({
      title: `Delete variant "${variant.sku}"?`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    await this.variantService.remove(variant._id);
    this.notifications.success('Variant deleted');
    const productId = this.id();
    if (productId) this.variants.set(await this.variantService.listByProduct(productId));
  }

  protected variantLabel(variant: ProductVariant): string {
    return variant.attributes.map((a) => a.value).join(' / ') || variant.name || variant.sku;
  }
}
