import type { OrderStatus } from '@cafe-da-fisica/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Order } from './order.entity.js';

/**
 * Data access for orders: the only place that knows how orders are queried through TypeORM.
 * Services get the data from here and keep the business rules to themselves.
 */
@Injectable()
export class OrderDAO {
    constructor(
        @InjectRepository(Order)
        private readonly ordersRepository: Repository<Order>,
    ) {}

    findAll(): Promise<Order[]> {
        return this.ordersRepository.find({
            relations: { items: { product: true } },
            order: { createdAt: 'DESC', id: 'DESC' },
        });
    }

    async updateStatus(id: number, status: OrderStatus): Promise<boolean> {
        const result = await this.ordersRepository.update(id, { status });
        return (result.affected ?? 0) > 0;
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.ordersRepository.delete(id);
        return (result.affected ?? 0) > 0;
    }

    /** Orders created at or after `since`, newest first, with their items and products loaded. */
    findCreatedSince(since: Date): Promise<Order[]> {
        return this.ordersRepository.find({
            where: { createdAt: MoreThanOrEqual(since) },
            relations: { items: { product: true } },
            order: { createdAt: 'DESC', id: 'DESC' },
        });
    }
}
