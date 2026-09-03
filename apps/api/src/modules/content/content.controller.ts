import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { CreateContentDto, UpdateContentDto } from './dto/content.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import type { Content, Paginated } from '@ecom/types';

@ApiTags('admin/content')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/content')
export class ContentController {
  constructor(private readonly service: ContentService) {}

  @Get()
  findAll(@CurrentStore() storeId: string, @Query() query: ListQueryDto): Promise<Paginated<Content>> {
    return this.service.findAll(storeId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Content> {
    return this.service.findById(id);
  }

  @Post()
  create(@CurrentStore() storeId: string, @Body() dto: CreateContentDto): Promise<Content> {
    return this.service.create(storeId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContentDto): Promise<Content> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ id: string }> {
    await this.service.remove(id);
    return { id };
  }
}
