import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto, BulkCategoryStatusDto } from './dto/category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import type { Category, Paginated } from '@ecom/types';

@ApiTags('admin/categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List categories (paginated)' })
  findAll(@CurrentStore() storeId: string, @Query() query: ListQueryDto): Promise<Paginated<Category>> {
    return this.service.findAll(storeId, query);
  }

  @Get('tree')
  @ApiOperation({ summary: 'All categories as a flat list for tree building' })
  tree(@CurrentStore() storeId: string): Promise<Category[]> {
    return this.service.findAllTree(storeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category' })
  findOne(@Param('id') id: string): Promise<Category> {
    return this.service.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a category' })
  create(@CurrentStore() storeId: string, @Body() dto: CreateCategoryDto): Promise<Category> {
    return this.service.create(storeId, dto);
  }

  @Patch('bulk-status')
  @ApiOperation({ summary: 'Bulk update status' })
  bulkStatus(@Body() dto: BulkCategoryStatusDto) {
    return this.service.bulkStatus(dto.ids, dto.status);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto): Promise<Category> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  async remove(@Param('id') id: string): Promise<{ id: string }> {
    await this.service.remove(id);
    return { id };
  }
}
