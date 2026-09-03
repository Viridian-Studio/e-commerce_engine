import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto, UpdateCollectionDto } from './dto/collection.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import type { Collection, Paginated } from '@ecom/types';

@ApiTags('admin/collections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/collections')
export class CollectionsController {
  constructor(private readonly service: CollectionsService) {}

  @Get()
  findAll(@CurrentStore() storeId: string, @Query() query: ListQueryDto): Promise<Paginated<Collection>> {
    return this.service.findAll(storeId, query);
  }

  @Get('list')
  list(@CurrentStore() storeId: string): Promise<Collection[]> {
    return this.service.findAllList(storeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Collection> {
    return this.service.findById(id);
  }

  @Post()
  create(@CurrentStore() storeId: string, @Body() dto: CreateCollectionDto): Promise<Collection> {
    return this.service.create(storeId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCollectionDto): Promise<Collection> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ id: string }> {
    await this.service.remove(id);
    return { id };
  }
}
