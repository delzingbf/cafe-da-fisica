import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { validateEnv } from '../config/env.js';
import { DatabaseModule } from '../database/database.module.js';
import { Product } from '../products/product.entity.js';
import { Settings } from '../settings/settings.entity.js';
import { testDataSource } from '../../test/setup-database.js';
import { OrderItem } from './order-item.entity.js';
import { Order } from './order.entity.js';

// Exercises the rules that live in the database itself (constraints, cascades), through the
// same Nest wiring feature modules will use.
describe('orders schema (integration)', () => {
    let orders: Repository<Order>;
    let products: Repository<Product>;
    let settings: Repository<Settings>;
    let close: () => Promise<void>;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
                DatabaseModule,
                TypeOrmModule.forFeature([Order, OrderItem, Product, Settings]),
            ],
        }).compile();

        orders = moduleRef.get(getRepositoryToken(Order));
        products = moduleRef.get(getRepositoryToken(Product));
        settings = moduleRef.get(getRepositoryToken(Settings));
        close = () => moduleRef.close();
    });

    afterAll(() => close());

    async function createProduct(overrides: Partial<Product> = {}) {
        return products.save(products.create({ name: 'Café coado', price: 4.5, ...overrides }));
    }

    async function createOrder(items: Array<{ product: Product; quantity: number }>) {
        return orders.save(
            orders.create({
                customerName: 'Ana',
                customerEmail: 'ana@example.com',
                items: items.map(({ product, quantity }) =>
                    Object.assign(new OrderItem(), {
                        productId: product.id,
                        quantity,
                        unitPrice: product.price,
                    }),
                ),
            }),
        );
    }

    it('saves an order with its items and reads prices back as numbers', async () => {
        const coffee = await createProduct();
        const order = await createOrder([{ product: coffee, quantity: 2 }]);

        const saved = await orders.findOneOrFail({
            where: { id: order.id },
            relations: { items: true },
        });

        expect(saved.status).toBe('pending');
        expect(saved.paymentOption).toBe('pix');
        expect(saved.deliveryMethod).toBe('delivery');
        expect(saved.createdAt).toBeInstanceOf(Date);
        expect(saved.items).toEqual([
            expect.objectContaining({ productId: coffee.id, quantity: 2, unitPrice: 4.5 }),
        ]);
    });

    it('deletes the items together with the order (ON DELETE CASCADE)', async () => {
        const coffee = await createProduct();
        const order = await createOrder([{ product: coffee, quantity: 1 }]);

        await orders.delete(order.id);

        await expect(testDataSource.getRepository(OrderItem).count()).resolves.toBe(0);
    });

    it('keeps a product from being deleted while an order references it', async () => {
        const coffee = await createProduct();
        await createOrder([{ product: coffee, quantity: 1 }]);

        await expect(products.delete(coffee.id)).rejects.toThrow(/foreign key/i);
    });

    it('rejects a non-positive quantity (CHECK)', async () => {
        const coffee = await createProduct();

        await expect(createOrder([{ product: coffee, quantity: 0 }])).rejects.toThrow(
            /CHK_order_items_quantity_positive/,
        );
    });

    it.each([
        ['not-an-email', /CHK_orders_customer_email_format/],
        ['Ana@Example.com', /CHK_orders_customer_email_lowercase/],
    ])('rejects the customer email %p', async (customerEmail, constraint) => {
        await expect(
            orders.save(orders.create({ customerName: 'Ana', customerEmail })),
        ).rejects.toThrow(constraint);
    });

    it('allows a single settings row', async () => {
        await settings.save({ id: true, orderNotificationEmail: 'pedidos@example.com' });

        await expect(
            settings.insert({ id: false, orderNotificationEmail: 'outro@example.com' }),
        ).rejects.toThrow(/CHK_settings_singleton/);
        await expect(settings.count()).resolves.toBe(1);
    });
});
