import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AttributesService } from './attributes.service';
import { CreateAttributeDto, UpdateAttributeDto } from './dto/attribute.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import type { Attribute, Paginated } from '@ecom/types';

@ApiTags('admin/attributes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/attributes')
export class AttributesController {
  constructor(private readonly service: AttributesService) {}

  @Get()
  findAll(@CurrentStore() storeId: string, @Query() query: ListQueryDto): Promise<Paginated<Attribute>> {
    return this.service.findAll(storeId, query);
  }

  @Get('list')
  list(@CurrentStore() storeId: string): Promise<Attribute[]> {
    return this.service.findAllList(storeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Attribute> {
    return this.service.findById(id);
  }

  @Post()
  create(@CurrentStore() storeId: string, @Body() dto: CreateAttributeDto): Promise<Attribute> {
    return this.service.create(storeId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAttributeDto): Promise<Attribute> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ id: string }> {
    await this.service.remove(id);
    return { id };
  }
}
