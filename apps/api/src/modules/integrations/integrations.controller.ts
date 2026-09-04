import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ViridianService, ViridianInventoryItem, ViridianTestResult } from './viridian.service';
import { ViridianImportService, ViridianImportResult } from './viridian-import.service';
import { TestViridianDto } from './dto/test-viridian.dto';
import { ImportViridianDto } from './dto/import-viridian.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';

@ApiTags('admin/integrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/integrations')
export class IntegrationsController {
  constructor(
    private readonly viridian: ViridianService,
    private readonly viridianImport: ViridianImportService,
  ) {}

  @Post('viridian/test')
  @ApiOperation({ summary: 'Test the Viridian Warehouse connection with an API key' })
  testViridian(@Body() dto: TestViridianDto): Promise<ViridianTestResult> {
    return this.viridian.testConnection(dto.apiKey);
  }

  @Post('viridian/inventory')
  @ApiOperation({ summary: 'List Viridian Warehouse inventory items available to import' })
  listViridianInventory(@Body() dto: TestViridianDto): Promise<ViridianInventoryItem[]> {
    return this.viridian.listInventory(dto.apiKey);
  }

  @Post('viridian/import')
  @ApiOperation({ summary: 'Import selected Viridian Warehouse items as draft products' })
  importViridian(
    @CurrentStore() storeId: string,
    @Body() dto: ImportViridianDto,
  ): Promise<ViridianImportResult> {
    return this.viridianImport.import(storeId, dto.apiKey, dto.itemIds);
  }
}
