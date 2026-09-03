import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StoreSetting, StoreSettingDocument } from './schemas/setting.schema';
import { UpsertSettingDto } from './dto/setting.dto';

@Injectable()
export class SettingsService {
  constructor(@InjectModel(StoreSetting.name) private readonly model: Model<StoreSettingDocument>) {}

  async findAll(storeId: string): Promise<Record<string, unknown>> {
    const rows = await this.model.find({ storeId }).exec();
    const out: Record<string, unknown> = {};
    for (const r of rows) out[r.key] = r.value;
    return out;
  }

  async get(storeId: string, key: string): Promise<unknown | null> {
    const row = await this.model.findOne({ storeId, key }).exec();
    return row?.value ?? null;
  }

  async upsert(storeId: string, dto: UpsertSettingDto): Promise<StoreSetting> {
    return this.model
      .findOneAndUpdate({ storeId, key: dto.key }, { value: dto.value }, { new: true, upsert: true })
      .exec();
  }

  async upsertMany(storeId: string, items: UpsertSettingDto[]): Promise<Record<string, unknown>> {
    for (const item of items) {
      await this.upsert(storeId, item);
    }
    return this.findAll(storeId);
  }

  async remove(storeId: string, key: string): Promise<void> {
    await this.model.deleteOne({ storeId, key }).exec();
  }
}
