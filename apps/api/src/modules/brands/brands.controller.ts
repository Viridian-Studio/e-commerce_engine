import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import type { Brand, Paginated } from '@ecom/types';

@ApiTags('admin/brands')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/brands')
export class BrandsController {
  constructor(private readonly service: BrandsService) {}

  @Get()
  findAll(@CurrentStore() storeId: string, @Query() query: ListQueryDto): Promise<Paginated<Brand>> {
    return this.service.findAll(storeId, query);
  }

  @Get('list')
  list(@CurrentStore() storeId: string): Promise<Brand[]> {
    return this.service.findAllList(storeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Brand> {
    return this.service.findById(id);
  }

  @Post()
  create(@CurrentStore() storeId: string, @Body() dto: CreateBrandDto): Promise<Brand> {
    return this.service.create(storeId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBrandDto): Promise<Brand> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ id: string }> {
    await this.service.remove(id);
    return { id };
  }
}
