import { Controller, Post, Param, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('admin/payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post('orders/:id/capture')
  @ApiOperation({ summary: 'Capture payment for an order (manual provider for MVP)' })
  capture(@Param('id') id: string, @Body() body: { provider?: string }) {
    return this.service.capture(id, body.provider);
  }

  @Post('orders/:id/refund')
  @ApiOperation({ summary: 'Refund an order' })
  refund(@Param('id') id: string) {
    return this.service.refund(id);
  }
}
