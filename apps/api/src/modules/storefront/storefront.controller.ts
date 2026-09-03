import { BadRequestException, Body, Controller, Get, Param, Post, Query, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StorefrontService } from './storefront.service';
import { Public, IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { CurrentCustomer } from '../../common/decorators/current-customer.decorator';
import { CustomerJwtAuthGuard } from '../customers/guards/customer-jwt.guard';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { AddCartItemDto, UpdateCartItemDto } from '../carts/dto/cart.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { StripePaymentProvider } from '../payments/stripe.provider';
import { PaymentsService } from '../payments/payments.service';
import type { Brand, Cart, Category, Collection, CustomerAuthUser, Order, Paginated, Product, Store } from '@ecom/types';

/**
 * Public, customer-facing API. Any storefront (Angular, React, Vue, ...) can
 * consume these endpoints — they expose only what a shopper needs, never
 * admin-only data or operations.
 */
@ApiTags('storefront')
@Public()
@Controller('storefront')
export class StorefrontController {
  constructor(
    private readonly service: StorefrontService,
    private readonly stripe: StripePaymentProvider,
    private readonly payments: PaymentsService,
  ) {}

  @Get('store')
  @ApiOperation({ summary: 'Resolve the active store by slug' })
  getStore(@Query('slug') slug?: string): Promise<Store> {
    return this.service.resolveStore(slug);
  }

  @Get('payments/config')
  @ApiOperation({ summary: 'Public Stripe publishable key for the storefront' })
  async getPaymentConfig(@CurrentStore() storeId: string): Promise<{ publishableKey: string | null }> {
    return { publishableKey: await this.stripe.publishableKey(storeId) };
  }

  @Get('products')
  @ApiOperation({ summary: 'List active products for the current store' })
  listProducts(@CurrentStore() storeId: string, @Query() query: ListQueryDto): Promise<Paginated<Product>> {
    this.requireStore(storeId);
    return this.service.listProducts(storeId, query);
  }

  @Get('products/:slug')
  @ApiOperation({ summary: 'Get a single product by slug' })
  getProduct(@CurrentStore() storeId: string, @Param('slug') slug: string): Promise<Product> {
    this.requireStore(storeId);
    return this.service.getProductBySlug(storeId, slug);
  }

  @Get('categories')
  listCategories(@CurrentStore() storeId: string): Promise<Category[]> {
    this.requireStore(storeId);
    return this.service.listCategories(storeId);
  }

  @Get('collections')
  listCollections(@CurrentStore() storeId: string): Promise<Collection[]> {
    this.requireStore(storeId);
    return this.service.listCollections(storeId);
  }

  @Get('brands')
  listBrands(@CurrentStore() storeId: string): Promise<Brand[]> {
    this.requireStore(storeId);
    return this.service.listBrands(storeId);
  }

  @Get('shipping/rate')
  @ApiOperation({ summary: 'Preview the shipping cost for a country + subtotal' })
  getShippingRate(
    @CurrentStore() storeId: string,
    @Query('country') country: string,
    @Query('subtotal') subtotal: string,
  ): Promise<{ price: number; name: string }> {
    this.requireStore(storeId);
    return this.service.getShippingRate(storeId, country, Number(subtotal) || 0);
  }

  @Get('discount/preview')
  @ApiOperation({ summary: 'Preview a discount code against a subtotal, without recording a usage' })
  previewDiscount(
    @CurrentStore() storeId: string,
    @Query('code') code: string,
    @Query('subtotal') subtotal: string,
  ): Promise<{ amount: number; code: string }> {
    this.requireStore(storeId);
    return this.service.previewDiscount(storeId, code, Number(subtotal) || 0);
  }

  @Post('cart')
  @ApiOperation({ summary: 'Create or resume a cart — pass back the returned token on later requests' })
  createCart(@CurrentStore() storeId: string, @Body('token') token?: string): Promise<Cart> {
    this.requireStore(storeId);
    return this.service.getOrCreateCart(storeId, token);
  }

  @Get('cart')
  getCart(@CurrentStore() storeId: string, @Query('token') token: string): Promise<Cart> {
    this.requireStore(storeId);
    return this.service.getCartByToken(storeId, token);
  }

  @Post('cart/items')
  @ApiOperation({ summary: 'Add an item to the cart (creates a cart if no token is supplied)' })
  addItem(
    @CurrentStore() storeId: string,
    @Query('token') token: string | undefined,
    @Body() dto: AddCartItemDto,
  ): Promise<Cart> {
    this.requireStore(storeId);
    return this.service.addItem(storeId, token, dto);
  }

  @Post('cart/items/:itemId')
  @ApiOperation({ summary: 'Update a cart item quantity' })
  updateItem(
    @CurrentStore() storeId: string,
    @Query('token') token: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ): Promise<Cart> {
    this.requireStore(storeId);
    return this.service.updateItem(storeId, token, itemId, dto);
  }

  @Post('cart/items/:itemId/remove')
  @ApiOperation({ summary: 'Remove a cart item' })
  removeItem(
    @CurrentStore() storeId: string,
    @Query('token') token: string,
    @Param('itemId') itemId: string,
  ): Promise<Cart> {
    this.requireStore(storeId);
    return this.service.removeItem(storeId, token, itemId);
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Convert a cart into an order (guest checkout supported)' })
  checkout(@CurrentStore() storeId: string, @Body() dto: CheckoutDto): Promise<Order> {
    this.requireStore(storeId);
    return this.service.checkout(storeId, dto);
  }

  @Post('payments/intent')
  @ApiOperation({ summary: 'Create a Stripe PaymentIntent for an order' })
  async createPaymentIntent(
    @CurrentStore() storeId: string,
    @Body() body: { orderId: string; email?: string },
  ): Promise<{ id: string; clientSecret: string }> {
    this.requireStore(storeId);
    const order = await this.service.getOrderForPayment(storeId, body.orderId);
    const intent = await this.stripe.createPaymentIntent({
      orderId: String(order._id),
      amount: order.totals.total,
      currency: order.totals.currency,
      email: body.email,
      storeId,
    });
    // Save the PI id on the order so the webhook / confirm endpoint can match it.
    await this.service.setPaymentIntentId(String(order._id), intent.id);
    return intent;
  }

  @Post('payments/confirm')
  @ApiOperation({ summary: 'Confirm a Stripe PaymentIntent status and mark the order paid if succeeded (webhook fallback)' })
  async confirmPayment(
    @CurrentStore() storeId: string,
    @Body() body: { paymentIntentId: string },
  ): Promise<{ status: string; paid: boolean }> {
    this.requireStore(storeId);
    return this.payments.confirmPaymentByIntentId(body.paymentIntentId, storeId);
  }

  @UseGuards(CustomerJwtAuthGuard)
  @SetMetadata(IS_PUBLIC_KEY, false)
  @ApiBearerAuth()
  @Get('orders')
  @ApiOperation({ summary: "List the authenticated customer's orders in the current store" })
  listMyOrders(
    @CurrentStore() storeId: string,
    @CurrentCustomer() customer: CustomerAuthUser,
    @Query() query: ListQueryDto,
  ): Promise<Paginated<Order>> {
    this.requireStore(storeId);
    return this.service.listCustomerOrders(storeId, customer.id, query);
  }

  private requireStore(storeId: string | null): void {
    if (!storeId) {
      throw new BadRequestException(
        "Missing store context. Send the 'x-store-id' header or a 'storeId' query parameter.",
      );
    }
  }
}
