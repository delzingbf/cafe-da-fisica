import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../mail/mail.module.js';
import { Product } from '../products/product.entity.js';
import { Settings } from '../settings/settings.entity.js';
import { OrderEmailsService } from './emails/order-email.service.js';
import { Order } from './order.entity.js';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';

@Module({
    imports: [TypeOrmModule.forFeature([Order, Product, Settings]), MailModule],
    controllers: [OrdersController],
    providers: [OrdersService, OrderEmailsService],
})
export class OrdersModule {}
