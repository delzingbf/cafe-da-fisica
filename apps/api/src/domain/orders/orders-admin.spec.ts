import { NotFoundException } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { validate } from 'class-validator';
import { AdminGuard } from '../auth/admin.guard.js';
import { OrdersController } from './orders.controller.js';
import { UpdateOrderStatusDto } from './orders.dto.js';
import type { OrderDAO } from './order.dao.js';
import { OrdersService } from './orders.service.js';

describe('Order administration', () => {
    it('protects listing, updates and deletion with the admin guard', () => {
        for (const method of ['findAll', 'updateStatus', 'delete'] as const) {
            expect(
                Reflect.getMetadata(GUARDS_METADATA, OrdersController.prototype[method]),
            ).toContain(AdminGuard);
        }
    });

    it('rejects unsupported or missing statuses', async () => {
        for (const status of ['shipped', undefined]) {
            const dto = Object.assign(new UpdateOrderStatusDto(), { status });
            expect(await validate(dto)).not.toHaveLength(0);
        }
        expect(
            await validate(Object.assign(new UpdateOrderStatusDto(), { status: 'confirmed' })),
        ).toHaveLength(0);
    });

    it('reports nonexistent orders for both mutations', async () => {
        const dao = {
            updateStatus: vi.fn().mockResolvedValue(false),
            delete: vi.fn().mockResolvedValue(false),
        };
        const service = new OrdersService(
            {} as never,
            {} as never,
            {} as never,
            dao as unknown as OrderDAO,
        );
        await expect(service.updateStatus(999, 'confirmed')).rejects.toBeInstanceOf(
            NotFoundException,
        );
        await expect(service.delete(999)).rejects.toBeInstanceOf(NotFoundException);
        dao.updateStatus.mockResolvedValue(true);
        dao.delete.mockResolvedValue(true);
        await expect(service.updateStatus(3, 'cancelled')).resolves.toBeUndefined();
        await expect(service.delete(3)).resolves.toBeUndefined();
    });
});
