import {
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    ParseIntPipe,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import type { ProductResponse } from '@cafe-da-fisica/shared';
import { AdminGuard } from '../auth/admin.guard.js';
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

    @Get('archived')
    @UseGuards(AdminGuard)
    findArchived(): Promise<ProductResponse[]> {
        return this.productsService.findArchived();
    }

    // Archives instead of deleting: see ProductsService.archive.
    @Delete(':id')
    @HttpCode(204)
    @UseGuards(AdminGuard)
    archive(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.productsService.archive(id);
    }

    @Post(':id/restore')
    @HttpCode(204)
    @UseGuards(AdminGuard)
    restore(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.productsService.restore(id);
    }
}
