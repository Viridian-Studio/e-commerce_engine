import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import type { Paginated, ProductVariant } from '@ecom/types';

@ApiTags('admin/inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/inventory')
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Get()
  list(@CurrentStore() storeId: string, @Query() query: ListQueryDto) {
    return this.service.list(storeId, query);
  }

  @Get('summary')
  summary(@CurrentStore() storeId: string) {
    return this.service.summary(storeId);
  }

  @Get('low-stock')
  lowStock(@CurrentStore() storeId: string): Promise<ProductVariant[]> {
    return this.service.lowStock(storeId);
  }
}
