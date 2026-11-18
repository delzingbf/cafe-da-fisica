import type {
    OrderReportOrder,
    OrderReportProduct,
    OrderReportResponse,
    OrderResponse,
} from '@cafe-da-fisica/shared';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from '../products/product.entity.js';
import { OrderEmailsService } from './emails/order-email.service.js';
import { orderTotal } from './emails/order-email.templates.js';
import { OrderItem } from './order-item.entity.js';
import { OrderDAO } from './order.dao.js';
import { Order } from './order.entity.js';
import type { CreateOrderDto } from './orders.dto.js';

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const REPORT_HISTORY_DAYS = 4 * 7;
const REPORT_SUMMARY_DAYS = 7;

// Money is summed as floating point; rounding to cents keeps 0.1 + 0.2 noise out of the report.
const roundMoney = (value: number) => Math.round(value * 100) / 100;

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);

    constructor(
        @InjectRepository(Order)
        private readonly ordersRepository: Repository<Order>,
        @InjectRepository(Product)
        private readonly productsRepository: Repository<Product>,
        private readonly orderEmails: OrderEmailsService,
        private readonly orderDao: OrderDAO,
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

    /**
     * UC6: the orders of the last 4 weeks, plus what was ordered and earned in the last week.
     * Both windows are rolling (28 and 7 days back from `now`), not calendar weeks.
     */
    async getReport(now: Date = new Date()): Promise<OrderReportResponse> {
        const historyFrom = new Date(now.getTime() - REPORT_HISTORY_DAYS * DAY_IN_MS);
        const summaryFrom = new Date(now.getTime() - REPORT_SUMMARY_DAYS * DAY_IN_MS);

        // One query for both windows: the last week is a slice of the last 4 weeks.
        const orders = await this.orderDao.findCreatedSince(historyFrom);
        // Cancelled orders stay in the history (with their status) but bring in no money.
        const lastWeekOrders = orders.filter(
            (order) => order.createdAt >= summaryFrom && order.status !== 'cancelled',
        );

        return {
            history: {
                from: historyFrom.toISOString(),
                to: now.toISOString(),
                orders: orders.map((order) => this.mapOrderToReportOrder(order)),
            },
            lastWeek: {
                from: summaryFrom.toISOString(),
                to: now.toISOString(),
                ordersCount: lastWeekOrders.length,
                products: this.summarizeProducts(lastWeekOrders),
                totalRevenue: roundMoney(
                    lastWeekOrders.reduce((sum, order) => sum + orderTotal(order), 0),
                ),
            },
        };
    }

    private mapOrderToReportOrder(order: Order): OrderReportOrder {
        return {
            id: order.id,
            customerName: order.customerName,
            status: order.status,
            paymentOption: order.paymentOption,
            deliveryMethod: order.deliveryMethod,
            createdAt: order.createdAt.toISOString(),
            total: roundMoney(orderTotal(order)),
            items: order.items
                .map((item) => ({
                    productId: item.productId,
                    productName: item.product.name,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                }))
                .sort((a, b) => a.productName.localeCompare(b.productName, 'pt-BR')),
        };
    }

    /** Units and revenue per product, best sellers first. */
    private summarizeProducts(orders: Order[]): OrderReportProduct[] {
        const byProduct = new Map<number, OrderReportProduct>();

        for (const item of orders.flatMap((order) => order.items)) {
            const summary = byProduct.get(item.productId) ?? {
                productId: item.productId,
                productName: item.product.name,
                quantity: 0,
                revenue: 0,
            };
            summary.quantity += item.quantity;
            summary.revenue = roundMoney(summary.revenue + item.unitPrice * item.quantity);
            byProduct.set(item.productId, summary);
        }

        return [...byProduct.values()].sort(
            (a, b) =>
                b.quantity - a.quantity || a.productName.localeCompare(b.productName, 'pt-BR'),
        );
    }

    private mapOrderToResponse(order: Order): OrderResponse {
        return { id: order.id, status: order.status, total: orderTotal(order) };
    }
}
