import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AttributesController } from './attributes.controller';
import { AttributesService } from './attributes.service';
import { Attribute, AttributeSchema } from './schemas/attribute.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Attribute.name, schema: AttributeSchema }])],
  controllers: [AttributesController],
  providers: [AttributesService],
  exports: [AttributesService],
})
export class AttributesModule {}
