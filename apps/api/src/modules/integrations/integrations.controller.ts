import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ViridianService, ViridianTestResult } from './viridian.service';
import { TestViridianDto } from './dto/test-viridian.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('admin/integrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/integrations')
export class IntegrationsController {
  constructor(private readonly viridian: ViridianService) {}

  @Post('viridian/test')
  @ApiOperation({ summary: 'Test the Viridian Warehouse connection with an API key' })
  testViridian(@Body() dto: TestViridianDto): Promise<ViridianTestResult> {
    return this.viridian.testConnection(dto.apiKey);
  }
}
