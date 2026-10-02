import type { OrderResponse } from '@cafe-da-fisica/shared';
import { Body, Controller, Post } from '@nestjs/common';
import { CreateOrderDto } from './orders.dto.js';
import { OrdersService } from './orders.service.js';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Post()
    create(@Body() dto: CreateOrderDto): Promise<OrderResponse> {
        return this.ordersService.create(dto);
    }
}
