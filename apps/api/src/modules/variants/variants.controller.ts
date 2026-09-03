import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { VariantsService } from './variants.service';
import { CreateVariantDto, UpdateVariantDto, AdjustStockDto } from './dto/variant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import type { ProductVariant } from '@ecom/types';

@ApiTags('admin/variants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/variants')
export class VariantsController {
  constructor(private readonly service: VariantsService) {}

  @Get('product/:productId')
  @ApiOperation({ summary: 'List variants for a product' })
  findByProduct(
    @CurrentStore() storeId: string,
    @Param('productId') productId: string,
  ): Promise<ProductVariant[]> {
    return this.service.findByProduct(storeId, productId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ProductVariant> {
    return this.service.findById(id);
  }

  @Post('product/:productId')
  @ApiOperation({ summary: 'Create a variant for a product' })
  create(
    @CurrentStore() storeId: string,
    @Param('productId') productId: string,
    @Body() dto: CreateVariantDto,
  ): Promise<ProductVariant> {
    return this.service.create(storeId, productId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVariantDto): Promise<ProductVariant> {
    return this.service.update(id, dto);
  }

  @Patch(':id/stock')
  @ApiOperation({ summary: 'Adjust variant stock (delta or absolute)' })
  adjustStock(@Param('id') id: string, @Body() dto: AdjustStockDto): Promise<ProductVariant> {
    return this.service.adjustStock(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ id: string }> {
    await this.service.remove(id);
    return { id };
  }
}
