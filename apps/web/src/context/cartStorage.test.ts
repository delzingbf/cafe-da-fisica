import { describe, expect, it } from 'vitest';
import type { ProductResponse } from '@cafe-da-fisica/shared';
import type { CartItem } from './cartContext';
import { syncCart } from './cartStorage';

const coffee: ProductResponse = {
    id: 1,
    name: 'Café coado',
    price: 4,
    available: true,
    type: 'coffee',
    vegan: false,
    imageUrl: null,
};

const cookie: ProductResponse = {
    id: 2,
    name: 'Cookie de aveia',
    price: 7.5,
    available: true,
    type: 'sweet',
    vegan: true,
    imageUrl: null,
};

describe('syncCart', () => {
    const cart: CartItem[] = [
        { product: coffee, quantity: 2 },
        { product: cookie, quantity: 1 },
    ];

    it('returns the same array when nothing changed', () => {
        expect(syncCart(cart, [cookie, coffee])).toBe(cart);
    });

    it('updates prices and names and keeps the quantities', () => {
        const synced = syncCart(cart, [{ ...coffee, price: 5, name: 'Café passado' }, cookie]);

        expect(synced).toEqual([
            { product: { ...coffee, price: 5, name: 'Café passado' }, quantity: 2 },
            { product: cookie, quantity: 1 },
        ]);
    });

    it('drops products that left the menu or became unavailable', () => {
        expect(syncCart(cart, [{ ...coffee, available: false }])).toEqual([]);
    });
});
