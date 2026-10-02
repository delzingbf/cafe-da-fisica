import { Controller, Get } from '@nestjs/common';
import type { ProductResponse } from '@cafe-da-fisica/shared';
import { ProductsService } from './products.service.js';

@Controller('products')
export class ProductsController {
    private readonly productsService: ProductsService;

    constructor(productsService: ProductsService) {
        this.productsService = productsService;
    }

    // constructor(private readonly productsService: ProductsService) {}

    @Get()
    findAll(): Promise<ProductResponse[]> {
        return this.productsService.findAll();
    }
}
