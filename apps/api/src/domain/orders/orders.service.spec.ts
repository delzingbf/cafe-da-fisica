import type { OrderDAO } from './order.dao.js';
import type { Order } from './order.entity.js';
import { OrdersService } from './orders.service.js';

const NOW = new Date('2026-11-14T12:00:00.000Z');
const daysAgo = (days: number) => new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);

type ItemFixture = [productId: number, name: string, quantity: number, unitPrice: number];

function order(id: number, createdAt: Date, items: ItemFixture[], status = 'confirmed'): Order {
    return {
        id,
        customerName: `Cliente ${id}`,
        customerEmail: `cliente${id}@example.com`,
        status,
        paymentOption: 'pix',
        deliveryMethod: 'pickup',
        deliveryLocation: null,
        createdAt,
        items: items.map(([productId, name, quantity, unitPrice]) => ({
            orderId: id,
            productId,
            quantity,
            unitPrice,
            product: { id: productId, name },
        })),
    } as unknown as Order;
}

function serviceWith(orders: Order[]) {
    const orderDao = { findCreatedSince: vi.fn().mockResolvedValue(orders) };
    const service = new OrdersService(
        {} as never,
        {} as never,
        {} as never,
        orderDao as unknown as OrderDAO,
    );
    return { service, orderDao };
}

describe('OrdersService.getReport', () => {
    it('asks for the orders of the last 4 weeks (28 days)', async () => {
        const { service, orderDao } = serviceWith([]);

        const report = await service.getReport(NOW);

        expect(orderDao.findCreatedSince).toHaveBeenCalledExactlyOnceWith(daysAgo(28));
        expect(report.history.from).toBe(daysAgo(28).toISOString());
        expect(report.history.to).toBe(NOW.toISOString());
    });

    it('lists the whole history, cancelled orders included, with each order total', async () => {
        const { service } = serviceWith([
            order(3, daysAgo(1), [[1, 'Café coado', 2, 4.5]]),
            order(2, daysAgo(10), [[2, 'Pão de queijo', 3, 6]], 'cancelled'),
            order(1, daysAgo(27), [[1, 'Café coado', 1, 4.5]], 'pending'),
        ]);

        const { history } = await service.getReport(NOW);

        expect(history.orders.map((o) => [o.id, o.status, o.total])).toEqual([
            [3, 'confirmed', 9],
            [2, 'cancelled', 18],
            [1, 'pending', 4.5],
        ]);
        expect(history.orders[0]).toEqual(
            expect.objectContaining({
                customerName: 'Cliente 3',
                paymentOption: 'pix',
                deliveryMethod: 'pickup',
                createdAt: daysAgo(1).toISOString(),
                items: [{ productId: 1, productName: 'Café coado', quantity: 2, unitPrice: 4.5 }],
            }),
        );
    });

    it('sums products and revenue of the last 7 days only, leaving cancelled orders out', async () => {
        const { service } = serviceWith([
            order(5, daysAgo(1), [
                [1, 'Café coado', 2, 4.5],
                [2, 'Pão de queijo', 1, 6],
            ]),
            order(4, daysAgo(3), [[1, 'Café coado', 1, 4.5]], 'pending'),
            order(3, daysAgo(2), [[2, 'Pão de queijo', 10, 6]], 'cancelled'),
            order(2, daysAgo(7), [[3, 'Bolo', 1, 8]]),
            order(1, daysAgo(8), [[3, 'Bolo', 5, 8]]),
        ]);

        const { lastWeek } = await service.getReport(NOW);

        expect(lastWeek.ordersCount).toBe(3);
        expect(lastWeek.products).toEqual([
            { productId: 1, productName: 'Café coado', quantity: 3, revenue: 13.5 },
            // Same quantity: the tie is broken by name.
            { productId: 3, productName: 'Bolo', quantity: 1, revenue: 8 },
            { productId: 2, productName: 'Pão de queijo', quantity: 1, revenue: 6 },
        ]);
        expect(lastWeek.totalRevenue).toBe(27.5);
        expect(lastWeek.from).toBe(daysAgo(7).toISOString());
    });

    it('rounds money to cents', async () => {
        const { service } = serviceWith([
            order(1, daysAgo(1), [
                [1, 'Suco', 1, 0.1],
                [2, 'Bala', 1, 0.2],
            ]),
        ]);

        const { lastWeek } = await service.getReport(NOW);

        expect(lastWeek.totalRevenue).toBe(0.3);
    });

    it('returns an empty report when there are no orders', async () => {
        const { service } = serviceWith([]);

        const report = await service.getReport(NOW);

        expect(report.history.orders).toEqual([]);
        expect(report.lastWeek).toEqual(
            expect.objectContaining({ ordersCount: 0, products: [], totalRevenue: 0 }),
        );
    });
});
