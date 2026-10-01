import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { ProductResponse } from '@cafe-da-fisica/shared';
import { Repository } from 'typeorm';
import { Product } from './product.entity.js';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private readonly products: Repository<Product>,
    ) {}

    async findAll(): Promise<ProductResponse[]> {
        const products = await this.products.find({
            where: { shown: true },
            order: { name: 'ASC' },
        });

        return products.map(({ id, name, price, available, type, vegan, imageUrl }) => ({
            id,
            name,
            price,
            available,
            type,
            vegan,
            imageUrl,
        }));
    }
}
