import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  UpdatePaymentStatusDto,
} from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import type { Order, Paginated } from '@ecom/types';

@ApiTags('admin/orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List orders (paginated, filterable)' })
  findAll(@CurrentStore() storeId: string, @Query() query: ListQueryDto): Promise<Paginated<Order>> {
    return this.service.findAll(storeId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Order> {
    return this.service.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create an order (admin/manual)' })
  create(@CurrentStore() storeId: string, @Body() dto: CreateOrderDto): Promise<Order> {
    return this.service.create(storeId, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status (adds timeline event)' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto): Promise<Order> {
    return this.service.updateStatus(id, dto);
  }

  @Patch(':id/payment')
  @ApiOperation({ summary: 'Update payment status' })
  updatePayment(@Param('id') id: string, @Body() dto: UpdatePaymentStatusDto): Promise<Order> {
    return this.service.updatePaymentStatus(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ id: string }> {
    await this.service.remove(id);
    return { id };
  }
}
