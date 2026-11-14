import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../../infrastructure/mail/mail.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { Product } from '../products/product.entity.js';
import { Settings } from '../settings/settings.entity.js';
import { OrderEmailsService } from './emails/order-email.service.js';
import { OrderDAO } from './order.dao.js';
import { Order } from './order.entity.js';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';

@Module({
    imports: [TypeOrmModule.forFeature([Order, Product, Settings]), AuthModule, MailModule],
    controllers: [OrdersController],
    providers: [OrdersService, OrderEmailsService, OrderDAO],
})
export class OrdersModule {}
