import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import type { Customer, Paginated } from '@ecom/types';

@ApiTags('admin/customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/customers')
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  @Get()
  findAll(@CurrentStore() storeId: string, @Query() query: ListQueryDto): Promise<Paginated<Customer>> {
    return this.service.findAll(storeId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Customer> {
    return this.service.findById(id);
  }

  @Post()
  create(@CurrentStore() storeId: string, @Body() dto: CreateCustomerDto): Promise<Customer> {
    return this.service.create(storeId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto): Promise<Customer> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ id: string }> {
    await this.service.remove(id);
    return { id };
  }
}
