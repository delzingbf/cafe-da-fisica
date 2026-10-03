import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './health/health.module.js';
import { ProductsModule } from './products/products.module.js';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
        DatabaseModule,
        HealthModule,
        ProductsModule,
        // Feature modules (e.g. ProductsModule, OrdersModule) are registered here.
    ],
})
export class AppModule {}
