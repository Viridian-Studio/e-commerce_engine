import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { StoresService } from './stores.service';
import { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '@ecom/types';
import type { Store } from '@ecom/types';

@ApiTags('admin/stores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  @ApiOperation({ summary: 'List stores' })
  findAll(): Promise<Store[]> {
    return this.storesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a store' })
  findOne(@Param('id') id: string): Promise<Store> {
    return this.storesService.findById(id);
  }

  @Post()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.STORE_ADMIN)
  @ApiOperation({ summary: 'Create a store' })
  create(@Body() dto: CreateStoreDto): Promise<Store> {
    return this.storesService.create(dto);
  }

  @Patch(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.STORE_ADMIN)
  @ApiOperation({ summary: 'Update a store' })
  update(@Param('id') id: string, @Body() dto: UpdateStoreDto): Promise<Store> {
    return this.storesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a store' })
  async remove(@Param('id') id: string): Promise<{ id: string }> {
    await this.storesService.remove(id);
    return { id };
  }
}
