import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './infrastructure/config/env.js';
import { DatabaseModule } from './infrastructure/database/database.module.js';
import { HealthModule } from './infrastructure/health/health.module.js';
import { ProductsModule } from './domain/products/products.module.js';
import { OrdersModule } from './domain/orders/orders.module.js';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
        DatabaseModule,
        HealthModule,
        ProductsModule,
        OrdersModule,
    ],
})
export class AppModule {}
