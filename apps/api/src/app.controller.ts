import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
  @Get()
  health() {
    return { status: 'ok', service: 'e-commerce-engine', version: '0.1.0' };
  }
}
