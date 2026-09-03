import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DiscountsService } from './discounts.service';
import { CreateDiscountDto, UpdateDiscountDto } from './dto/discount.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import type { Discount, Paginated } from '@ecom/types';

@ApiTags('admin/discounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/discounts')
export class DiscountsController {
  constructor(private readonly service: DiscountsService) {}

  @Get()
  findAll(@CurrentStore() storeId: string, @Query() query: ListQueryDto): Promise<Paginated<Discount>> {
    return this.service.findAll(storeId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Discount> {
    return this.service.findById(id);
  }

  @Post()
  create(@CurrentStore() storeId: string, @Body() dto: CreateDiscountDto): Promise<Discount> {
    return this.service.create(storeId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDiscountDto): Promise<Discount> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ id: string }> {
    await this.service.remove(id);
    return { id };
  }
}
