import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { ProductResponse } from '@cafe-da-fisica/shared';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { Product } from './product.entity.js';
import { FindAllParameters } from './products.dto.js';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private readonly productsRepository: Repository<Product>
    ) {}

    async findAll(params: FindAllParameters): Promise<ProductResponse[]> {
        const searchParams: FindOptionsWhere<Product> = {};

        if (params.name) {
            searchParams.name = ILike(`%${params.name}%`);
        }

        if (params.available !== undefined) {
            searchParams.available = params.available;
        }

        if (params.type) {
            searchParams.type = params.type;
        }

        if (params.vegan !== undefined) {
            searchParams.vegan = params.vegan;
        }

        const productsFound = await this.productsRepository.find({
            where: searchParams,
            order: { name: 'ASC' }
        });

        return productsFound.map(product => this.mapProductToResponse(product));
    }

    private mapProductToResponse(p: Product): ProductResponse {
        return {
            id: p.id,
            name: p.name,
            price: p.price,
            available: p.available,
            type: p.type,
            vegan: p.vegan,
            imageUrl: p.imageUrl
        }
    }
}
