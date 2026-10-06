// Populates the database with development data. Run with `npm run db:seed` (idempotent).
import { Product } from '../../domain/products/product.entity.js';
import { Settings } from '../../domain/settings/settings.entity.js';
import dataSource from './data-source.js';

const products: Partial<Product>[] = [
    { name: 'Café coado', price: 4.0, type: 'coffee' },
    { name: 'Pão de queijo', price: 6.5, type: 'savory' },
    { name: 'Bolo de cenoura', price: 8.0, type: 'sweet' },
    { name: 'Cookie de aveia', price: 7.0, type: 'sweet', vegan: true },
    { name: 'Palha italiana', price: 3.0, type: 'sweet' },
    { name: 'Térmica de café (1L)', price: 12.5, type: 'coffee' },
    { name: 'Brownie', price: 8.0, type: 'sweet' },
    { name: 'Esfiha', price: 4.5, type: 'savory' },
    { name: 'Cookie integral', price: 9.0, type: 'sweet' },
    { name: 'Sanduíche natural', price: 10.0, type: 'savory', vegan: true },
];

async function main() {
    await dataSource.transaction(async (manager) => {
        for (const product of products) {
            const exists = await manager.existsBy(Product, { name: product.name });
            if (!exists) await manager.insert(Product, product);
        }

        // Single row keyed by `id = true` (see Settings entity).
        await manager.upsert(
            Settings,
            { id: true, orderNotificationEmail: 'pedidos@example.com' },
            { conflictPaths: ['id'], skipUpdateIfNoValuesChanged: true },
        );
    });

    console.log(`Seeded ${products.length} products and settings.`);
}

await dataSource.initialize();
try {
    await main();
} finally {
    await dataSource.destroy();
}
