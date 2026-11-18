import type { OrderReportOrder, OrderReportResponse, OrderResponse } from '@cafe-da-fisica/shared';
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard.js';
import { CreateOrderDto, UpdateOrderStatusDto } from './orders.dto.js';
import { OrdersService } from './orders.service.js';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Post()
    create(@Body() dto: CreateOrderDto): Promise<OrderResponse> {
        return this.ordersService.create(dto);
    }

    @Get()
    @UseGuards(AdminGuard)
    findAll(): Promise<OrderReportOrder[]> {
        return this.ordersService.findAll();
    }

    @Patch(':id/status')
    @UseGuards(AdminGuard)
    @HttpCode(204)
    updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateOrderStatusDto,
    ): Promise<void> {
        return this.ordersService.updateStatus(id, dto.status);
    }

    @Delete(':id')
    @UseGuards(AdminGuard)
    @HttpCode(204)
    delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.ordersService.delete(id);
    }

    @Get('report')
    @UseGuards(AdminGuard)
    getReport(): Promise<OrderReportResponse> {
        return this.ordersService.getReport();
    }
}
