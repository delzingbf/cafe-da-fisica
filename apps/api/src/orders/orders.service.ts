import type { OrderResponse } from '@cafe-da-fisica/shared';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from '../products/product.entity.js';
import { OrderEmailsService } from './emails/order-email.service.js';
import { orderTotal } from './emails/order-email.templates.js';
import { OrderItem } from './order-item.entity.js';
import { Order } from './order.entity.js';
import type { CreateOrderDto } from './orders.dto.js';

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);

    constructor(
        @InjectRepository(Order)
        private readonly ordersRepository: Repository<Order>,
        @InjectRepository(Product)
        private readonly productsRepository: Repository<Product>,
        private readonly orderEmails: OrderEmailsService,
    ) {}

    async create(dto: CreateOrderDto): Promise<OrderResponse> {
        const productIds = dto.items.map((item) => item.productId);
        const products = await this.productsRepository.findBy({
            id: In(productIds),
            shown: true,
            available: true,
        });
        const productsById = new Map(products.map((p) => [p.id, p]));

        const unavailable = productIds.filter((id) => !productsById.has(id));
        if (unavailable.length > 0) {
            throw new BadRequestException(`Products unavailable: ${unavailable.join(', ')}`);
        }

        // `save` runs in a transaction: the order and its items are inserted together or not at all.
        const saved = await this.ordersRepository.save(
            this.ordersRepository.create({
                customerName: dto.customerName,
                customerEmail: dto.customerEmail,
                paymentOption: dto.paymentOption,
                deliveryMethod: dto.deliveryMethod,
                deliveryLocation: dto.deliveryMethod === 'delivery' ? dto.deliveryLocation : null,
                items: dto.items.map((item) =>
                    Object.assign(new OrderItem(), {
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: productsById.get(item.productId)!.price,
                    }),
                ),
            }),
        );

        const order = await this.ordersRepository.findOneOrFail({
            where: { id: saved.id },
            relations: { items: { product: true } },
        });

        // After the commit and not awaited: an email outage must never fail an order already saved.
        void this.orderEmails.sendOrderCreated(order).catch((error: unknown) => {
            this.logger.error(`Failed to send emails for order #${order.id}`, error);
        });

        return this.mapOrderToResponse(order);
    }

    private mapOrderToResponse(order: Order): OrderResponse {
        return { id: order.id, status: order.status, total: orderTotal(order) };
    }
}
