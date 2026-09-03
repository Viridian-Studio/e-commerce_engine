import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReturnsController } from './returns.controller';
import { ReturnsService } from './returns.service';
import { ReturnRequest, ReturnRequestSchema } from './schemas/return.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: ReturnRequest.name, schema: ReturnRequestSchema }])],
  controllers: [ReturnsController],
  providers: [ReturnsService],
  exports: [ReturnsService],
})
export class ReturnsModule {}
