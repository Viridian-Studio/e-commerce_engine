import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ShippingService } from './shipping.service';
import { CreateShippingZoneDto, UpdateShippingZoneDto } from './dto/shipping.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import type { Paginated, ShippingZone } from '@ecom/types';

@ApiTags('admin/shipping')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/shipping')
export class ShippingController {
  constructor(private readonly service: ShippingService) {}

  @Get()
  findAll(@CurrentStore() storeId: string, @Query() query: ListQueryDto): Promise<Paginated<ShippingZone>> {
    return this.service.findAll(storeId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ShippingZone> {
    return this.service.findById(id);
  }

  @Post()
  create(@CurrentStore() storeId: string, @Body() dto: CreateShippingZoneDto): Promise<ShippingZone> {
    return this.service.create(storeId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateShippingZoneDto): Promise<ShippingZone> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ id: string }> {
    await this.service.remove(id);
    return { id };
  }
}
