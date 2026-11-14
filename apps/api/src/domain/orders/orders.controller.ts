import type { OrderReportResponse, OrderResponse } from '@cafe-da-fisica/shared';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard.js';
import { CreateOrderDto } from './orders.dto.js';
import { OrdersService } from './orders.service.js';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Post()
    create(@Body() dto: CreateOrderDto): Promise<OrderResponse> {
        return this.ordersService.create(dto);
    }

    // POST /orders is public (customers order); only the report is for admins.
    @Get('report')
    @UseGuards(AdminGuard)
    getReport(): Promise<OrderReportResponse> {
        return this.ordersService.getReport();
    }
}
