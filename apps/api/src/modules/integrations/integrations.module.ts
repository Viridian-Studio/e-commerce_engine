import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { ViridianService } from './viridian.service';

@Module({
  controllers: [IntegrationsController],
  providers: [ViridianService],
  exports: [ViridianService],
})
export class IntegrationsModule {}
