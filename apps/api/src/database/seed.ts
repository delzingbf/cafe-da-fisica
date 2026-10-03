// Populates the database with development data. Run with `npm run db:seed` (idempotent).
import { Product } from '../products/product.entity.js';
import { Settings } from '../settings/settings.entity.js';
import dataSource from './data-source.js';

const products: Partial<Product>[] = [
    { name: 'Café coado', price: 4.0, type: 'coffee' },
    { name: 'Pão de queijo', price: 6.5, type: 'savory' },
    { name: 'Bolo de cenoura', price: 8.0, type: 'sweet' },
    { name: 'Cookie de aveia', price: 7.0, type: 'sweet', vegan: true },
    { name: 'Palha italiana', price: 5.0, type: 'sweet' },
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
