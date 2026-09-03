import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { StoreSetting, StoreSettingSchema } from './schemas/setting.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: StoreSetting.name, schema: StoreSettingSchema }])],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
