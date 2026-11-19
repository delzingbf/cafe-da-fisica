import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { API_PREFIX, type CreateOrderRequest } from '@cafe-da-fisica/shared';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { Order } from '../src/domain/orders/order.entity.js';
import { Product } from '../src/domain/products/product.entity.js';
import { testDataSource } from './setup-database.js';

describe('Orders (e2e)', () => {
    let app: INestApplication<App>;
    let coffee: Product;
    let cake: Product;

    beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        configureApp(app);
        await app.init();
    });

    beforeEach(async () => {
        const products = testDataSource.getRepository(Product);
        [coffee, cake] = await products.save([
            products.create({ name: 'Café coado', price: 4.5 }),
            products.create({ name: 'Bolo de cenoura', price: 8 }),
        ]);
    });

    afterAll(async () => {
        await app.close();
    });

    const tomorrow = () => new Date(Date.now() + 24 * 60 * 60 * 1000);

    function orderBody(overrides: Partial<CreateOrderRequest> = {}): CreateOrderRequest {
        return {
            customerName: ' Ana ',
            customerEmail: 'Ana@Example.com',
            paymentOption: 'pix',
            deliveryMethod: 'delivery',
            deliveryLocation: 'Prédio 43164, sala 203',
            scheduledAt: tomorrow().toISOString(),
            items: [
                { productId: coffee.id, quantity: 2 },
                { productId: cake.id, quantity: 1 },
            ],
            ...overrides,
        };
    }

    const placeOrder = (body: object) =>
        request(app.getHttpServer()).post(`/${API_PREFIX}/orders`).send(body);

    it('saves the order with its items and scheduled time', async () => {
        const body = orderBody();

        const res = await placeOrder(body).expect(201);

        expect(res.body).toEqual({ id: expect.any(Number), status: 'pending', total: 17 });
        const saved = await testDataSource.getRepository(Order).findOneOrFail({
            where: { id: res.body.id },
            relations: { items: true },
        });
        expect(saved).toMatchObject({
            customerName: 'Ana',
            customerEmail: 'ana@example.com',
            deliveryLocation: 'Prédio 43164, sala 203',
            scheduledAt: new Date(body.scheduledAt),
        });
        expect(saved.items).toHaveLength(2);
    });

    it('drops the delivery location of a pickup', async () => {
        const res = await placeOrder(orderBody({ deliveryMethod: 'pickup' })).expect(201);

        const saved = await testDataSource
            .getRepository(Order)
            .findOneByOrFail({ id: res.body.id });
        expect(saved.deliveryLocation).toBeNull();
    });

    it.each([
        ['missing', undefined],
        ['not a date', 'amanhã'],
        ['in the past', new Date(Date.now() - 60_000).toISOString()],
    ])('rejects a scheduled time that is %s', async (_, scheduledAt) => {
        await placeOrder({ ...orderBody(), scheduledAt }).expect(400);

        await expect(testDataSource.getRepository(Order).count()).resolves.toBe(0);
    });

    it('names the products that can no longer be ordered', async () => {
        await testDataSource.getRepository(Product).update(cake.id, { available: false });

        const res = await placeOrder(orderBody()).expect(400);

        expect(res.body.unavailableProductIds).toEqual([cake.id]);
        await expect(testDataSource.getRepository(Order).count()).resolves.toBe(0);
    });
});
