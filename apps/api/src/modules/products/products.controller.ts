import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, BulkProductStatusDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import type { Product, Paginated } from '@ecom/types';

@ApiTags('admin/products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List products (paginated, filterable)' })
  findAll(@CurrentStore() storeId: string, @Query() query: ListQueryDto): Promise<Paginated<Product>> {
    return this.service.findAll(storeId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Product> {
    return this.service.findById(id);
  }

  @Post()
  create(@CurrentStore() storeId: string, @Body() dto: CreateProductDto): Promise<Product> {
    return this.service.create(storeId, dto);
  }

  @Patch('bulk-status')
  @ApiOperation({ summary: 'Bulk update product status' })
  bulkStatus(@Body() dto: BulkProductStatusDto) {
    return this.service.bulkStatus(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto): Promise<Product> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ id: string }> {
    await this.service.remove(id);
    return { id };
  }
}
