import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReturnsService } from './returns.service';
import { CreateReturnDto, UpdateReturnStatusDto } from './dto/return.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import type { Paginated, ReturnRequest } from '@ecom/types';

@ApiTags('admin/returns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/returns')
export class ReturnsController {
  constructor(private readonly service: ReturnsService) {}

  @Get()
  findAll(@CurrentStore() storeId: string, @Query() query: ListQueryDto): Promise<Paginated<ReturnRequest>> {
    return this.service.findAll(storeId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ReturnRequest> {
    return this.service.findById(id);
  }

  @Post()
  create(@CurrentStore() storeId: string, @Body() dto: CreateReturnDto): Promise<ReturnRequest> {
    return this.service.create(storeId, dto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateReturnStatusDto): Promise<ReturnRequest> {
    return this.service.updateStatus(id, dto);
  }
}
