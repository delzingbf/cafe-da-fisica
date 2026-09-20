import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { Env } from '../config/env.js';
import { buildDataSourceOptions } from './typeorm.options.js';

// Opens the PostgreSQL connection for the whole app. TypeORM connects eagerly on startup:
// if the database is unreachable the API retries a few times and then refuses to boot.
// Feature modules get repositories with `TypeOrmModule.forFeature([Entity])`.
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService<Env, true>) => ({
                ...buildDataSourceOptions(config.get('DATABASE_URL', { infer: true })),
                retryAttempts: 3,
                retryDelay: 1000,
            }),
        }),
    ],
})
export class DatabaseModule {}
