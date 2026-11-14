import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { API_PREFIX, type OrderReportResponse, type OrderStatus } from '@cafe-da-fisica/shared';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { Admin } from '../src/domain/admins/admin.entity.js';
import { hashPassword } from '../src/domain/auth/password.js';
import { OrderItem } from '../src/domain/orders/order-item.entity.js';
import { Order } from '../src/domain/orders/order.entity.js';
import { Product } from '../src/domain/products/product.entity.js';
import { testDataSource } from './setup-database.js';

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

describe('GET /orders/report (e2e)', () => {
    const email = 'admin@example.com';
    const password = 'correct horse battery staple';
    let app: INestApplication<App>;

    beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        configureApp(app);
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    const report = () => request(app.getHttpServer()).get(`/${API_PREFIX}/orders/report`);

    async function createOrder(
        createdAt: Date,
        status: OrderStatus,
        lines: Array<{ product: Product; quantity: number }>,
    ) {
        const orders = testDataSource.getRepository(Order);
        return orders.save(
            orders.create({
                customerName: 'Ana',
                customerEmail: 'ana@example.com',
                status,
                createdAt,
                items: lines.map(({ product, quantity }) =>
                    Object.assign(new OrderItem(), {
                        productId: product.id,
                        quantity,
                        unitPrice: product.price,
                    }),
                ),
            }),
        );
    }

    it('answers 401 without an admin session', async () => {
        await report().expect(401);
    });

    it('gives the admin 4 weeks of history and the last week summary', async () => {
        await testDataSource.getRepository(Admin).save({
            email,
            passwordHash: await hashPassword(password),
        });
        const login = await request(app.getHttpServer())
            .post(`/${API_PREFIX}/auth/login`)
            .send({ email, password })
            .expect(200);
        const cookie = ([] as string[]).concat(login.headers['set-cookie'] ?? [])[0].split(';')[0];

        const products = testDataSource.getRepository(Product);
        const coffee = await products.save(products.create({ name: 'Café coado', price: 4.5 }));
        const cake = await products.save(products.create({ name: 'Bolo', price: 8 }));

        await createOrder(daysAgo(40), 'confirmed', [{ product: cake, quantity: 9 }]);
        await createOrder(daysAgo(10), 'confirmed', [{ product: cake, quantity: 1 }]);
        await createOrder(daysAgo(2), 'pending', [{ product: coffee, quantity: 2 }]);
        await createOrder(daysAgo(1), 'cancelled', [{ product: cake, quantity: 5 }]);

        const res = await report().set('Cookie', cookie).expect(200);
        const body = res.body as OrderReportResponse;

        // The 40-day-old order is out; the rest come newest first, the cancelled one included.
        expect(body.history.orders.map((o) => [o.status, o.total])).toEqual([
            ['cancelled', 40],
            ['pending', 9],
            ['confirmed', 8],
        ]);
        expect(body.history.orders[1].items).toEqual([
            { productId: coffee.id, productName: 'Café coado', quantity: 2, unitPrice: 4.5 },
        ]);
        // Last week: only the pending order counts (the cancelled one brings in no money).
        expect(body.lastWeek.ordersCount).toBe(1);
        expect(body.lastWeek.products).toEqual([
            { productId: coffee.id, productName: 'Café coado', quantity: 2, revenue: 9 },
        ]);
        expect(body.lastWeek.totalRevenue).toBe(9);
    });
});
