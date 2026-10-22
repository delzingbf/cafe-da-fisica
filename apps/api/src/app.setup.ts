import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { API_PREFIX } from '@cafe-da-fisica/shared';
import cookieParser from 'cookie-parser';
import type { Env } from './infrastructure/config/env.js';

// Shared by main.ts and the e2e tests, so tests exercise the app exactly as it runs.
export function configureApp(app: INestApplication): void {
    const config = app.get(ConfigService<Env, true>);

    app.setGlobalPrefix(API_PREFIX);
    app.enableCors({ origin: config.get('CORS_ORIGIN', { infer: true }) });
    // Fills `request.cookies` (the admin session cookie is read by AdminGuard).
    app.use(cookieParser());
    // Strips unknown properties and converts primitives for every DTO validated with class-validator.
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    // Lets providers (e.g. the TypeORM DataSource) clean up on SIGTERM/SIGINT.
    app.enableShutdownHooks();
}
