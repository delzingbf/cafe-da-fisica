import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { API_PREFIX } from '@cafe-da-fisica/shared';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';
import type { Env } from './infrastructure/config/env.js';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const config = app.get(ConfigService<Env, true>);

    configureApp(app);

    const port = config.get('PORT', { infer: true });
    await app.listen(port);
    Logger.log(`API listening on http://localhost:${port}/${API_PREFIX}`, 'Bootstrap');
}

await bootstrap();
