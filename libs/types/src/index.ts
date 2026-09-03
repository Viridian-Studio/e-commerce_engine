/**
 * Shared domain types for the E-Commerce Engine.
 * Consumed by both the NestJS API and the Angular admin (and future storefronts).
 */

export type ID = string;

/**
 * A point in time.
 *
 * Over the wire (JSON) this is always an ISO-8601 string. Inside the API,
 * Mongoose hydrates the same field as a `Date`, so the shared contract
 * accepts both and every consumer can pass it straight to a date formatter.
 */
export type ISODate = string | Date;

/* ---------------- Pagination & API envelope ---------------- */

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

/* ---------------- Enums ---------------- */

export enum StoreStatus {
  ACTIVE = 'active',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
}

export enum ProductStatus {
  ACTIVE = 'active',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
}

export enum VariantStatus {
  ACTIVE = 'active',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
}

export enum CategoryStatus {
  ACTIVE = 'active',
  DRAFT = 'draft',
}

export enum CustomerStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export enum FulfillmentStatus {
  UNFULFILLED = 'unfulfilled',
  PARTIAL = 'partial',
  FULFILLED = 'fulfilled',
}

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  STORE_ADMIN = 'store_admin',
  MANAGER = 'manager',
  STAFF = 'staff',
}

/* ---------------- Auth ---------------- */

export interface AuthUser {
  id: ID;
  email: string;
  name: string;
  role: AdminRole;
  storeIds?: ID[];
}

export interface AuthTokens {
  accessToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse extends AuthTokens {
  user: AuthUser;
}

/* ---------------- Customer auth ---------------- */

/**
 * The customer identity embedded in the customer JWT and returned by
 * /storefront/auth/{login,register,me}. Distinct from `AuthUser` (admin),
 * which is scoped to the `User` model and `AdminRole`.
 */
export interface CustomerAuthUser {
  id: ID;
  storeId: ID;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface CustomerRegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface CustomerLoginRequest {
  email: string;
  password: string;
}

export interface CustomerAuthResponse extends AuthTokens {
  customer: CustomerAuthUser;
}

/* ---------------- Store ---------------- */

export type StoreAppearance = 'dark' | 'light' | 'auto';

export interface StoreThemeConfig {
  primaryColor?: string;
  accentColor?: string;
  logoUrl?: string;
  faviconUrl?: string;
  /** Visual mode — `dark` (default), `light`, or `auto` (follows OS preference). */
  appearance?: StoreAppearance;
  /** Body font family — a CSS font stack or a Google Fonts family name. */
  fontFamily?: string;
  /** Heading font family — falls back to `fontFamily` when not set. */
  headingFontFamily?: string;
  /** Global border radius for buttons, cards, inputs in px (0-24, or -1 for full/pill). */
  borderRadius?: number;
  /** Optional announcement bar above the header. */
  announcement?: {
    text?: string;
    color?: string;
    background?: string;
    enabled?: boolean;
  };
}

export interface StorePaymentConfig {
  /** Stripe secret key (sk_live_... or sk_test_...). Server-only, never exposed to the storefront. */
  stripeSecretKey?: string;
  /** Stripe publishable key (pk_live_... or pk_test_...). Safe to expose to the browser. */
  stripePublishableKey?: string;
  /** Stripe webhook signing secret (whsec_...). Used to verify webhook signatures. */
  stripeWebhookSecret?: string;
}

export interface Store {
  _id: ID;
  name: string;
  slug: string;
  domain?: string;
  currency: string;
  locale: string;
  timezone: string;
  status: StoreStatus;
  contactEmail?: string;
  theme: StoreThemeConfig;
  payment: StorePaymentConfig;
  settings: Record<string, unknown>;
  createdAt: ISODate;
  updatedAt: ISODate;
}

/* ---------------- Catalog ---------------- */

export interface SeoFields {
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  keywords?: string[];
}

export interface ImageRef {
  url: string;
  alt?: string;
  position?: number;
}

export interface Category {
  _id: ID;
  storeId: ID;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: ID | null;
  status: CategoryStatus;
  seo?: SeoFields;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface Brand {
  _id: ID;
  storeId: ID;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  status: ProductStatus;
  seo?: SeoFields;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface Collection {
  _id: ID;
  storeId: ID;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  status: ProductStatus;
  seo?: SeoFields;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface AttributeValue {
  value: string;
  label?: string;
}

export interface Attribute {
  _id: ID;
  storeId: ID;
  name: string;
  slug: string;
  values: AttributeValue[];
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface VariantAttributeSelection {
  attributeSlug: string;
  value: string;
}

export interface ProductVariant {
  _id: ID;
  productId: ID;
  storeId: ID;
  sku: string;
  name?: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  stock: number;
  attributes: VariantAttributeSelection[];
  images: ImageRef[];
  status: VariantStatus;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface Product {
  _id: ID;
  storeId: ID;
  name: string;
  slug: string;
  description?: string;
  status: ProductStatus;
  brandId?: ID | null;
  categoryIds: ID[];
  collectionIds: ID[];
  images: ImageRef[];
  basePrice: number;
  compareAtPrice?: number;
  currency: string;
  seo?: SeoFields;
  variants?: ProductVariant[];
  createdAt: ISODate;
  updatedAt: ISODate;
}

/* ---------------- Customers ---------------- */

export interface Address {
  id?: ID;
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export interface Customer {
  _id: ID;
  storeId: ID;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: CustomerStatus;
  addresses: Address[];
  createdAt: ISODate;
  updatedAt: ISODate;
}

/* ---------------- Orders ---------------- */

export interface OrderLineItem {
  id?: ID;
  productId: ID;
  variantId?: ID | null;
  name: string;
  sku?: string;
  quantity: number;
  price: number;
  total: number;
  image?: string;
}

export interface OrderTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
}

export interface OrderEvent {
  id?: ID;
  status: OrderStatus;
  note?: string;
  createdAt: ISODate;
}

export interface Order {
  _id: ID;
  storeId: ID;
  number: string;
  customerId?: ID | null;
  customer?: { name: string; email: string; phone?: string };
  items: OrderLineItem[];
  totals: OrderTotals;
  shippingAddress?: Address;
  billingAddress?: Address;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  payment?: {
    provider: string;
    transactionId?: string;
    method?: string;
  };
  timeline: OrderEvent[];
  createdAt: ISODate;
  updatedAt: ISODate;
}

/* ---------------- Content ---------------- */

export enum ContentType {
  PAGE = 'page',
  BANNER = 'banner',
  BLOCK = 'block',
}

export interface Content {
  _id: ID;
  storeId: ID;
  title: string;
  slug: string;
  type: ContentType;
  body?: string;
  imageUrl?: string;
  linkUrl?: string;
  published: boolean;
  createdAt: ISODate;
  updatedAt: ISODate;
}

/* ---------------- Discounts ---------------- */

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum DiscountStatus {
  ACTIVE = 'active',
  SCHEDULED = 'scheduled',
  EXPIRED = 'expired',
  DISABLED = 'disabled',
}

export interface Discount {
  _id: ID;
  storeId: ID;
  code: string;
  description?: string;
  type: DiscountType;
  value: number;
  minSubtotal?: number | null;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usageCount: number;
  startsAt?: ISODate | null;
  endsAt?: ISODate | null;
  status: DiscountStatus;
  createdAt: ISODate;
  updatedAt: ISODate;
}

/* ---------------- Shipping ---------------- */

export enum ShippingRateType {
  FLAT = 'flat',
  FREE = 'free',
  WEIGHT = 'weight',
}

export interface ShippingRate {
  name: string;
  type: ShippingRateType;
  price: number;
  minSubtotal?: number;
  maxSubtotal?: number;
}

export interface ShippingZone {
  _id: ID;
  storeId: ID;
  name: string;
  countries: string[];
  rates: ShippingRate[];
  enabled: boolean;
  createdAt: ISODate;
  updatedAt: ISODate;
}

/* ---------------- Returns ---------------- */

export enum ReturnStatus {
  REQUESTED = 'requested',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ReturnType {
  REFUND = 'refund',
  EXCHANGE = 'exchange',
}

export interface ReturnItem {
  productId: ID;
  variantId?: ID | null;
  name: string;
  quantity: number;
  price: number;
}

export interface ReturnRequest {
  _id: ID;
  storeId: ID;
  orderId: ID;
  number: string;
  type: ReturnType;
  status: ReturnStatus;
  reason?: string;
  items: ReturnItem[];
  refundAmount: number;
  createdAt: ISODate;
  updatedAt: ISODate;
}

/* ---------------- Settings ---------------- */

export interface StoreSetting {
  _id: ID;
  storeId: ID;
  key: string;
  value: unknown;
  createdAt: ISODate;
  updatedAt: ISODate;
}

/* ---------------- Cart ---------------- */

export interface CartItem {
  productId: ID;
  variantId?: ID | null;
  name: string;
  sku?: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Cart {
  _id: ID;
  storeId: ID;
  token?: string;
  customerId?: ID | null;
  items: CartItem[];
  currency: string;
  shippingAddress?: Address | null;
  createdAt: ISODate;
  updatedAt: ISODate;
}

/* ---------------- Dashboard ---------------- */

export interface DashboardStats {
  revenue: number;
  orders: number;
  customers: number;
  products: number;
  averageOrderValue: number;
  currency: string;
  salesSeries: { date: string; revenue: number; orders: number }[];
  topProducts: { productId: ID; name: string; units: number; revenue: number }[];
  orderStatusBreakdown: { status: OrderStatus; count: number }[];
  recentOrders: Order[];
}
