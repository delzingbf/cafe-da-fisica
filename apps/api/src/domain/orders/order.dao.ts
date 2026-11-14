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

    /** Orders created at or after `since`, newest first, with their items and products loaded. */
    findCreatedSince(since: Date): Promise<Order[]> {
        return this.ordersRepository.find({
            where: { createdAt: MoreThanOrEqual(since) },
            relations: { items: { product: true } },
            order: { createdAt: 'DESC', id: 'DESC' },
        });
    }
}
