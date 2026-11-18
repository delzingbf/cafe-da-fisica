import type { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { API_PREFIX } from '@cafe-da-fisica/shared';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { Admin } from '../src/domain/admins/admin.entity.js';
import type { SessionPayload } from '../src/domain/auth/session.js';
import { SESSION_COOKIE } from '../src/domain/auth/session.js';
import { OrderItem } from '../src/domain/orders/order-item.entity.js';
import { Order } from '../src/domain/orders/order.entity.js';
import { Product } from '../src/domain/products/product.entity.js';
import { testDataSource } from './setup-database.js';

describe('Products (e2e)', () => {
    let app: INestApplication<App>;
    let adminCookie: string;

    beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        configureApp(app);
        await app.init();
    });

    // Signs the session directly instead of logging in, which is rate-limited per file.
    beforeEach(async () => {
        const admin = await testDataSource
            .getRepository(Admin)
            .save({ email: 'admin@example.com', passwordHash: 'unused' });
        const payload: SessionPayload = { sub: String(admin.id) };
        adminCookie = `${SESSION_COOKIE}=${await app.get(JwtService).signAsync(payload)}`;
    });

    afterAll(async () => {
        await app.close();
    });

    const createProduct = (overrides: Partial<Product> = {}) =>
        testDataSource
            .getRepository(Product)
            .save({ name: 'Brownie', price: 8, type: 'sweet', ...overrides });

    const api = () => request(app.getHttpServer());
    const menuNames = async () =>
        (await api().get(`/${API_PREFIX}/products`).expect(200)).body.map(
            (product: { name: string }) => product.name,
        );

    it('GET /products lists only products on the menu', async () => {
        await createProduct({ name: 'Brownie' });
        await createProduct({ name: 'Esfiha', shown: false });

        expect(await menuNames()).toEqual(['Brownie']);
    });

    it('DELETE /products/:id archives the product instead of deleting it', async () => {
        const brownie = await createProduct();

        await api()
            .delete(`/${API_PREFIX}/products/${brownie.id}`)
            .set('Cookie', adminCookie)
            .expect(204);

        expect(await menuNames()).toEqual([]);
        const saved = await testDataSource
            .getRepository(Product)
            .findOneByOrFail({ id: brownie.id });
        expect(saved.shown).toBe(false);

        const archived = await api()
            .get(`/${API_PREFIX}/products/archived`)
            .set('Cookie', adminCookie)
            .expect(200);
        expect(archived.body).toEqual([
            expect.objectContaining({ id: brownie.id, name: 'Brownie' }),
        ]);
    });

    it('archives a product that was already ordered and keeps the order intact', async () => {
        const brownie = await createProduct();
        const order = await testDataSource.getRepository(Order).save({
            customerName: 'Ana',
            customerEmail: 'ana@example.com',
            paymentOption: 'pix',
            deliveryMethod: 'pickup',
            scheduledAt: new Date(),
            items: [
                Object.assign(new OrderItem(), {
                    productId: brownie.id,
                    quantity: 2,
                    unitPrice: 8,
                }),
            ],
        });

        await api()
            .delete(`/${API_PREFIX}/products/${brownie.id}`)
            .set('Cookie', adminCookie)
            .expect(204);

        const items = await testDataSource.getRepository(OrderItem).findBy({ orderId: order.id });
        expect(items).toEqual([expect.objectContaining({ productId: brownie.id, quantity: 2 })]);
    });

    it('POST /products/:id/restore puts an archived product back on the menu', async () => {
        const esfiha = await createProduct({ name: 'Esfiha', shown: false });

        await api()
            .post(`/${API_PREFIX}/products/${esfiha.id}/restore`)
            .set('Cookie', adminCookie)
            .expect(204);

        expect(await menuNames()).toEqual(['Esfiha']);
    });

    it.each([
        ['archive', 'delete', '/products/1'],
        ['restore', 'post', '/products/1/restore'],
        ['list archived products', 'get', '/products/archived'],
    ] as const)('only an admin can %s', async (_case, method, path) => {
        await api()[method](`/${API_PREFIX}${path}`).expect(401);
    });

    it.each([
        ['archive', 'delete', '/products/999'],
        ['restore', 'post', '/products/999/restore'],
    ] as const)('cannot %s a product that does not exist', async (_case, method, path) => {
        await api()[method](`/${API_PREFIX}${path}`).set('Cookie', adminCookie).expect(404);
    });

    it('rejects an id that is not a number', async () => {
        await api().delete(`/${API_PREFIX}/products/abc`).set('Cookie', adminCookie).expect(400);
    });
});
