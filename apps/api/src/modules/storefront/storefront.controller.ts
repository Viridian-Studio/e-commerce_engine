import { BadRequestException, Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StorefrontService } from './storefront.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { AddCartItemDto, UpdateCartItemDto } from '../carts/dto/cart.dto';
import { CheckoutDto } from './dto/checkout.dto';
import type { Brand, Cart, Category, Collection, Order, Paginated, Product, Store } from '@ecom/types';

/**
 * Public, customer-facing API. Any storefront (Angular, React, Vue, ...) can
 * consume these endpoints — they expose only what a shopper needs, never
 * admin-only data or operations.
 */
@ApiTags('storefront')
@Public()
@Controller('storefront')
export class StorefrontController {
  constructor(private readonly service: StorefrontService) {}

  @Get('store')
  @ApiOperation({ summary: 'Resolve the active store by slug' })
  getStore(@Query('slug') slug?: string): Promise<Store> {
    return this.service.resolveStore(slug);
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

  private requireStore(storeId: string | null): void {
    if (!storeId) {
      throw new BadRequestException(
        "Missing store context. Send the 'x-store-id' header or a 'storeId' query parameter.",
      );
    }
  }
}
