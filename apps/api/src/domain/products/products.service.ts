import { Injectable, NotFoundException } from '@nestjs/common';
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
        // Archived products stay in the database for past orders, but leave the menu.
        const searchParams: FindOptionsWhere<Product> = { shown: true };

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

    /** Products removed from the menu, for the admin to restore. */
    async findArchived(): Promise<ProductResponse[]> {
        const productsFound = await this.productsRepository.find({
            where: { shown: false },
            order: { name: 'ASC' }
        });

        return productsFound.map(product => this.mapProductToResponse(product));
    }

    /**
     * Removes a product from the menu. The row is kept (`shown = false`) because past orders
     * point to it; deleting it would fail or rewrite order history.
     */
    async archive(id: number): Promise<void> {
        await this.setShown(id, false);
    }

    async restore(id: number): Promise<void> {
        await this.setShown(id, true);
    }

    private async setShown(id: number, shown: boolean): Promise<void> {
        const result = await this.productsRepository.update(id, { shown });
        if (result.affected === 0) {
            throw new NotFoundException(`Product ${id} not found`);
        }
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
