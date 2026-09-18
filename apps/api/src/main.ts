import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { API_PREFIX } from '@cafe-da-fisica/shared';
import { AppModule } from './app.module.js';
import type { Env } from './config/env.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<Env, true>);

  app.setGlobalPrefix(API_PREFIX);
  app.enableCors({ origin: config.get('CORS_ORIGIN', { infer: true }) });
  // Strips unknown properties and converts primitives for every DTO validated with class-validator.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // Lets providers (e.g. PrismaService) clean up on SIGTERM/SIGINT.
  app.enableShutdownHooks();

  const port = config.get('PORT', { infer: true });
  await app.listen(port);
  Logger.log(`API listening on http://localhost:${port}/${API_PREFIX}`, 'Bootstrap');
}

await bootstrap();
