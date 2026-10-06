import { Controller, Get, Query } from '@nestjs/common';
import type { ProductResponse } from '@cafe-da-fisica/shared';
import { ProductsService } from './products.service.js';
import type { FindAllParameters } from './products.dto.js';

@Controller('products')
export class ProductsController {
    private readonly productsService: ProductsService;

    constructor(productsService: ProductsService) {
        this.productsService = productsService;
    }

    @Get()
    findAll(@Query() params: FindAllParameters): Promise<ProductResponse[]> {
        return this.productsService.findAll(params);
    }
}
