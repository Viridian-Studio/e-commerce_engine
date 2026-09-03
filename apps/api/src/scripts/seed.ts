/**
 * Seeds MongoDB with a demo store, catalog, customers and orders.
 * Connects directly via Mongoose (no Nest DI) so it can run standalone: `npm run seed`.
 */
import 'reflect-metadata';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcryptjs';
import mongoose, { Types } from 'mongoose';

import { User, UserSchema } from '../modules/auth/schemas/user.schema';
import { Store, StoreSchema } from '../modules/stores/schemas/store.schema';
import { Category, CategorySchema } from '../modules/categories/schemas/category.schema';
import { Brand, BrandSchema } from '../modules/brands/schemas/brand.schema';
import { Collection, CollectionSchema } from '../modules/collections/schemas/collection.schema';
import { Attribute, AttributeSchema } from '../modules/attributes/schemas/attribute.schema';
import { Product, ProductSchema } from '../modules/products/schemas/product.schema';
import { ProductVariant, ProductVariantSchema } from '../modules/variants/schemas/variant.schema';
import { Customer, CustomerSchema } from '../modules/customers/schemas/customer.schema';
import { Order, OrderSchema } from '../modules/orders/schemas/order.schema';
import { Discount, DiscountSchema } from '../modules/discounts/schemas/discount.schema';
import { ShippingZone, ShippingZoneSchema, ShippingRateType } from '../modules/shipping/schemas/shipping-zone.schema';
import { slugify, roundMoney } from '../common/utils/slug';
import {
  AdminRole,
  CategoryStatus,
  CustomerStatus,
  DiscountStatus,
  DiscountType,
  FulfillmentStatus,
  OrderStatus,
  PaymentStatus,
  ProductStatus,
  StoreStatus,
  VariantStatus,
} from '@ecom/types';

// Load .env from the repo root so `npm run seed` works regardless of cwd.
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecommerce_engine';
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@ecommerce.engine';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';
const ADMIN_NAME = process.env.SEED_ADMIN_NAME || 'Engine Admin';

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function image(seed: string, w = 800, h = 1000): string {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

async function main() {
  console.log(`Connecting to ${MONGODB_URI} ...`);
  await mongoose.connect(MONGODB_URI);

  const UserModel = mongoose.model(User.name, UserSchema);
  const StoreModel = mongoose.model(Store.name, StoreSchema);
  const CategoryModel = mongoose.model(Category.name, CategorySchema);
  const BrandModel = mongoose.model(Brand.name, BrandSchema);
  const CollectionModel = mongoose.model(Collection.name, CollectionSchema);
  const AttributeModel = mongoose.model(Attribute.name, AttributeSchema);
  const ProductModel = mongoose.model(Product.name, ProductSchema);
  const VariantModel = mongoose.model(ProductVariant.name, ProductVariantSchema);
  const CustomerModel = mongoose.model(Customer.name, CustomerSchema);
  const OrderModel = mongoose.model(Order.name, OrderSchema);
  const DiscountModel = mongoose.model(Discount.name, DiscountSchema);
  const ShippingZoneModel = mongoose.model(ShippingZone.name, ShippingZoneSchema);

  // --- Admin user (global, not store-scoped) ---
  await UserModel.deleteOne({ email: ADMIN_EMAIL.toLowerCase() });
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await UserModel.create({
    email: ADMIN_EMAIL.toLowerCase(),
    name: ADMIN_NAME,
    passwordHash,
    role: AdminRole.SUPER_ADMIN,
    storeIds: [],
  });
  console.log(`Admin user ready: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);

  // --- Store (wipe and recreate demo store data so the seed is repeatable) ---
  const storeSlug = 'ultras-shop';
  const existingStore = await StoreModel.findOne({ slug: storeSlug });
  if (existingStore) {
    const storeId = existingStore._id.toString();
    await Promise.all([
      CategoryModel.deleteMany({ storeId }),
      BrandModel.deleteMany({ storeId }),
      CollectionModel.deleteMany({ storeId }),
      AttributeModel.deleteMany({ storeId }),
      ProductModel.deleteMany({ storeId }),
      VariantModel.deleteMany({ storeId }),
      CustomerModel.deleteMany({ storeId }),
      OrderModel.deleteMany({ storeId }),
      DiscountModel.deleteMany({ storeId }),
      ShippingZoneModel.deleteMany({ storeId }),
    ]);
    await StoreModel.deleteOne({ _id: existingStore._id });
  }

  const store = await StoreModel.create({
    name: 'Ultras Shop',
    slug: storeSlug,
    domain: undefined,
    currency: 'EUR',
    locale: 'en-US',
    timezone: 'Europe/Belgrade',
    status: StoreStatus.ACTIVE,
    contactEmail: 'hello@ultras.shop',
    theme: { primaryColor: '#e11d2e', accentColor: '#111111' },
    settings: {},
  });
  const storeId = store._id.toString();
  console.log(`Store ready: ${store.name} (${storeId})`);

  // --- Brands ---
  const brandDefs = ['Ultras Originals', 'Rebel Threads', 'Terrace Culture'];
  const brands = await BrandModel.insertMany(
    brandDefs.map((name) => ({
      storeId,
      name,
      slug: slugify(name),
      description: `${name} — streetwear built for the terraces.`,
      image: image(`brand-${slugify(name)}`, 400, 400),
      status: ProductStatus.ACTIVE,
    })),
  );

  // --- Categories (hierarchical) ---
  const clothing = await CategoryModel.create({
    storeId,
    name: 'Clothing',
    slug: 'clothing',
    description: 'Hoodies, t-shirts and jackets for real fans.',
    status: CategoryStatus.ACTIVE,
  });
  const accessories = await CategoryModel.create({
    storeId,
    name: 'Accessories',
    slug: 'accessories',
    description: 'Scarves, caps and the rest of the kit.',
    status: CategoryStatus.ACTIVE,
  });
  const childCategoryDefs: { name: string; parent: typeof clothing }[] = [
    { name: 'Hoodies', parent: clothing },
    { name: 'T-Shirts', parent: clothing },
    { name: 'Jackets', parent: clothing },
    { name: 'Scarves', parent: accessories },
    { name: 'Caps', parent: accessories },
  ];
  const childCategories = await CategoryModel.insertMany(
    childCategoryDefs.map(({ name, parent }) => ({
      storeId,
      name,
      slug: slugify(name),
      parentId: parent._id,
      status: CategoryStatus.ACTIVE,
    })),
  );
  const categoriesBySlug = new Map(
    [clothing, accessories, ...childCategories].map((c) => [c.slug, c]),
  );

  // --- Collections ---
  const collectionDefs = ['New Arrivals', 'Best Sellers', 'Sale'];
  const collections = await CollectionModel.insertMany(
    collectionDefs.map((name) => ({
      storeId,
      name,
      slug: slugify(name),
      description: `${name} from the Ultras Shop catalog.`,
      image: image(`collection-${slugify(name)}`, 800, 500),
      status: ProductStatus.ACTIVE,
    })),
  );

  // --- Attributes ---
  const colorAttribute = await AttributeModel.create({
    storeId,
    name: 'Color',
    slug: 'color',
    values: [
      { value: 'black', label: 'Black' },
      { value: 'white', label: 'White' },
      { value: 'red', label: 'Red' },
      { value: 'grey', label: 'Grey' },
    ],
  });
  const sizeAttribute = await AttributeModel.create({
    storeId,
    name: 'Size',
    slug: 'size',
    values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((v) => ({ value: v.toLowerCase(), label: v })),
  });
  void colorAttribute;
  void sizeAttribute;

  // --- Products + variants ---
  type ProductDef = {
    name: string;
    category: string;
    basePrice: number;
    compareAtPrice?: number;
    colors: string[];
    sizes: string[];
  };
  const productDefs: ProductDef[] = [
    { name: 'Ultras Skull Hoodie', category: 'hoodies', basePrice: 59.9, colors: ['black', 'grey'], sizes: ['S', 'M', 'L', 'XL'] },
    { name: 'Ultras Bandit Hoodie', category: 'hoodies', basePrice: 69.9, colors: ['black', 'white'], sizes: ['S', 'M', 'L', 'XL'] },
    { name: 'Ultras 2001 Hoodie', category: 'hoodies', basePrice: 64.9, colors: ['black'], sizes: ['M', 'L', 'XL', 'XXL'] },
    { name: 'Terrace Culture Hoodie', category: 'hoodies', basePrice: 58.9, compareAtPrice: 69.9, colors: ['grey', 'black'], sizes: ['S', 'M', 'L'] },
    { name: 'Against Modern Football Hoodie', category: 'hoodies', basePrice: 59.9, compareAtPrice: 69.9, colors: ['black'], sizes: ['S', 'M', 'L', 'XL'] },
    { name: 'Against Modern Football T-Shirt', category: 't-shirts', basePrice: 29.9, compareAtPrice: 35.0, colors: ['black', 'white'], sizes: ['XS', 'S', 'M', 'L', 'XL'] },
    { name: 'Ultras Ultras Hoodie', category: 'hoodies', basePrice: 59.9, colors: ['black', 'red'], sizes: ['S', 'M', 'L'] },
    { name: 'North Side Hoodie', category: 'hoodies', basePrice: 59.9, colors: ['black'], sizes: ['M', 'L', 'XL'] },
    { name: 'Football Hooligan Hoodie', category: 'hoodies', basePrice: 59.9, colors: ['black', 'grey'], sizes: ['S', 'M', 'L', 'XL'] },
    { name: 'Ultras Windbreaker', category: 'jackets', basePrice: 49.9, colors: ['black'], sizes: ['S', 'M', 'L', 'XL'] },
    { name: 'Ultras 2001 Scarf', category: 'scarves', basePrice: 19.9, colors: ['black', 'red'], sizes: [] },
    { name: 'Ultras 2001 Cap', category: 'caps', basePrice: 26.91, compareAtPrice: 29.9, colors: ['black', 'white'], sizes: [] },
  ];

  const products: InstanceType<typeof ProductModel>[] = [];
  for (const def of productDefs) {
    const category = categoriesBySlug.get(def.category);
    const slug = slugify(def.name);
    const product = await ProductModel.create({
      storeId,
      name: def.name,
      slug,
      description: `High quality ${def.name.toLowerCase()} made for real fans. Premium materials, built to last.`,
      status: ProductStatus.ACTIVE,
      brandId: pick(brands)._id,
      categoryIds: category ? [category._id] : [],
      collectionIds: [pick(collections)._id],
      images: [
        { url: image(`${slug}-1`), position: 0 },
        { url: image(`${slug}-2`), position: 1 },
      ],
      basePrice: def.basePrice,
      compareAtPrice: def.compareAtPrice ?? null,
      currency: store.currency,
      seo: { metaTitle: def.name, metaDescription: `Shop the ${def.name} at Ultras Shop.` },
    });
    products.push(product as any);

    const sizeOptions = def.sizes.length > 0 ? def.sizes : [null];
    let skuIndex = 1;
    for (const color of def.colors) {
      for (const size of sizeOptions) {
        const attributes = [{ attributeSlug: 'color', value: color }];
        if (size) attributes.push({ attributeSlug: 'size', value: size.toLowerCase() });
        await VariantModel.create({
          storeId,
          productId: product._id,
          sku: `${slug.toUpperCase().replace(/-/g, '')}-${skuIndex++}`,
          name: size ? `${color} / ${size}` : color,
          price: def.basePrice,
          compareAtPrice: def.compareAtPrice ?? null,
          currency: store.currency,
          stock: randomInt(0, 40),
          attributes,
          images: [],
          status: VariantStatus.ACTIVE,
        });
      }
    }
  }
  console.log(`Catalog ready: ${brands.length} brands, ${categoriesBySlug.size} categories, ${collections.length} collections, ${products.length} products.`);

  // --- Customers ---
  const customerDefs = [
    { firstName: 'Marko', lastName: 'Petrovic', email: 'marko.petrovic@example.com' },
    { firstName: 'Ana', lastName: 'Jovanovic', email: 'ana.jovanovic@example.com' },
    { firstName: 'Luka', lastName: 'Ilic', email: 'luka.ilic@example.com' },
    { firstName: 'Jelena', lastName: 'Nikolic', email: 'jelena.nikolic@example.com' },
    { firstName: 'Stefan', lastName: 'Pavlovic', email: 'stefan.pavlovic@example.com' },
    { firstName: 'Milica', lastName: 'Kovacevic', email: 'milica.kovacevic@example.com' },
  ];
  const countries = ['RS', 'DE', 'GB', 'NL'];
  const customers = await CustomerModel.insertMany(
    customerDefs.map((c) => ({
      storeId,
      email: c.email,
      firstName: c.firstName,
      lastName: c.lastName,
      phone: `+381 6${randomInt(0, 9)} ${randomInt(1000000, 9999999)}`,
      status: CustomerStatus.ACTIVE,
      addresses: [
        {
          _id: new Types.ObjectId(),
          firstName: c.firstName,
          lastName: c.lastName,
          line1: `${randomInt(1, 200)} Terrace Street`,
          city: 'Belgrade',
          postalCode: `1${randomInt(1000, 9999)}`,
          country: pick(countries),
          isDefault: true,
        },
      ],
    })),
  );
  console.log(`Customers ready: ${customers.length}`);

  // --- Orders ---
  const orderStatuses = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.PROCESSING,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
  ];
  const allVariants = await VariantModel.find({ storeId }).exec();
  const now = Date.now();
  let orderSeq = 1;
  for (let i = 0; i < 18; i++) {
    const customer = pick(customers);
    const itemCount = randomInt(1, 3);
    const chosenVariants = Array.from({ length: itemCount }, () => pick(allVariants));
    const items = chosenVariants.map((v) => {
      const product = products.find((p) => p._id.toString() === v.productId.toString());
      const quantity = randomInt(1, 2);
      const price = v.price;
      return {
        productId: v.productId,
        variantId: v._id,
        name: product ? product.name : 'Product',
        sku: v.sku,
        quantity,
        price,
        total: roundMoney(price * quantity),
        image: product?.images?.[0]?.url,
      };
    });
    const subtotal = roundMoney(items.reduce((sum, it) => sum + it.total, 0));
    const shipping = subtotal > 100 ? 0 : 9.9;
    const discount = Math.random() < 0.2 ? roundMoney(subtotal * 0.1) : 0;
    const tax = 0;
    const total = roundMoney(subtotal - discount + shipping + tax);
    const status = pick(orderStatuses);
    const paymentStatus =
      status === OrderStatus.CANCELLED
        ? PaymentStatus.REFUNDED
        : status === OrderStatus.PENDING
          ? PaymentStatus.PENDING
          : PaymentStatus.PAID;
    const fulfillmentStatus =
      status === OrderStatus.SHIPPED || status === OrderStatus.DELIVERED
        ? FulfillmentStatus.FULFILLED
        : status === OrderStatus.PROCESSING
          ? FulfillmentStatus.PARTIAL
          : FulfillmentStatus.UNFULFILLED;
    const createdAt = new Date(now - randomInt(0, 30) * 24 * 60 * 60 * 1000);

    await OrderModel.create({
      storeId,
      number: `ORD-${String(orderSeq++).padStart(5, '0')}`,
      customerId: customer._id,
      customer: { name: `${customer.firstName} ${customer.lastName}`, email: customer.email, phone: customer.phone },
      items,
      totals: { subtotal, discount, shipping, tax, total, currency: store.currency },
      shippingAddress: customer.addresses[0],
      billingAddress: customer.addresses[0],
      status,
      paymentStatus,
      fulfillmentStatus,
      payment: { provider: 'manual', transactionId: `manual-${randomInt(100000, 999999)}` },
      timeline: [{ status, note: 'Order created', createdAt }],
      createdAt,
      updatedAt: createdAt,
    });
  }
  console.log('Orders ready: 18');

  // --- Discounts ---
  await DiscountModel.insertMany([
    {
      storeId,
      code: 'WELCOME10',
      description: '10% off your first order',
      type: DiscountType.PERCENTAGE,
      value: 10,
      status: DiscountStatus.ACTIVE,
      usageCount: 0,
    },
    {
      storeId,
      code: 'SAVE20',
      description: '€20 off orders over €120',
      type: DiscountType.FIXED,
      value: 20,
      minSubtotal: 120,
      status: DiscountStatus.ACTIVE,
      usageCount: 0,
    },
  ]);

  // --- Shipping ---
  await ShippingZoneModel.create({
    storeId,
    name: 'Worldwide',
    countries: [],
    rates: [
      { name: 'Standard Shipping', type: ShippingRateType.FLAT, price: 9.9, maxSubtotal: 99.99 },
      { name: 'Free Shipping', type: ShippingRateType.FREE, price: 0, minSubtotal: 100 },
    ],
    enabled: true,
  });

  console.log('\nSeed complete.');
  console.log(`  Store:        ${store.name} (${store.slug}) — id ${storeId}`);
  console.log(`  Admin login:  ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`  Use header    x-store-id: ${storeId}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
