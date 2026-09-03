import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });
  const config = app.get(ConfigService);
  const prefix = config.get<string>('API_PREFIX', 'api');

  app.setGlobalPrefix(prefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN', 'http://localhost:4200'),
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('E-Commerce Engine API')
    .setDescription('Headless multi-store commerce engine. Admin: /api/admin/..., Storefront: /api/storefront/...')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${prefix}/docs`, app, document);

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);
  Logger.log(`API running on http://localhost:${port}/${prefix}`, 'Bootstrap');
  Logger.log(`Swagger at http://localhost:${port}/${prefix}/docs`, 'Bootstrap');
}

bootstrap();
