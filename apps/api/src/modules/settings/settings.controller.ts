import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpsertSettingDto } from './dto/setting.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';

@ApiTags('admin/settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/settings')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get()
  findAll(@CurrentStore() storeId: string) {
    return this.service.findAll(storeId);
  }

  @Get(':key')
  get(@CurrentStore() storeId: string, @Param('key') key: string) {
    return this.service.get(storeId, key);
  }

  @Post()
  upsert(@CurrentStore() storeId: string, @Body() dto: UpsertSettingDto) {
    return this.service.upsert(storeId, dto);
  }

  @Patch()
  upsertMany(@CurrentStore() storeId: string, @Body() body: { items: UpsertSettingDto[] }) {
    return this.service.upsertMany(storeId, body.items ?? []);
  }

  @Delete(':key')
  async remove(@CurrentStore() storeId: string, @Param('key') key: string) {
    await this.service.remove(storeId, key);
    return { key };
  }
}
