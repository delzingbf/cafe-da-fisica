import { StrictMode, type ReactNode } from 'react';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { ProductResponse } from '@cafe-da-fisica/shared';
import { useCart } from '../hooks/useCart';
import { CartProvider } from './CartProvider';
import { CART_STORAGE_KEY } from './cartStorage';

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

// StrictMode runs state updaters twice, which catches accidental state mutation.
function wrapper({ children }: { children: ReactNode }) {
    return (
        <StrictMode>
            <CartProvider>{children}</CartProvider>
        </StrictMode>
    );
}

function renderCart() {
    return renderHook(() => useCart(), { wrapper });
}

describe('CartProvider', () => {
    afterEach(() => {
        cleanup();
        localStorage.clear();
    });

    it('increments the quantity when the same product is added again', () => {
        const { result } = renderCart();

        act(() => result.current.addToCart(coffee));
        act(() => result.current.addToCart(coffee));
        act(() => result.current.addToCart(cookie));

        expect(result.current.cart).toEqual([
            { product: coffee, quantity: 2 },
            { product: cookie, quantity: 1 },
        ]);
        expect(result.current.totalItems).toBe(3);
        expect(result.current.totalPrice).toBe(15.5);
    });

    it('ignores unavailable products', () => {
        const { result } = renderCart();

        act(() => result.current.addToCart({ ...coffee, available: false }));

        expect(result.current.cart).toEqual([]);
    });

    it('removes the item when its quantity drops to zero', () => {
        const { result } = renderCart();

        act(() => result.current.addToCart(coffee));
        act(() => result.current.updateQuantity(coffee.id, 0));

        expect(result.current.cart).toEqual([]);
    });

    it('persists the cart to localStorage and restores it', () => {
        const first = renderCart();
        act(() => first.result.current.addToCart(cookie));
        first.unmount();

        const { result } = renderCart();

        expect(result.current.cart).toEqual([{ product: cookie, quantity: 1 }]);
    });

    it('drops malformed data from localStorage', () => {
        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify([{ product: coffee, quantity: 1 }, { product: null }, 'x']),
        );

        const { result } = renderCart();

        expect(result.current.cart).toEqual([{ product: coffee, quantity: 1 }]);
    });

    it('starts empty when localStorage holds something other than an array', () => {
        localStorage.setItem(CART_STORAGE_KEY, '{"not":"a cart"}');

        const { result } = renderCart();

        expect(result.current.cart).toEqual([]);
    });

    it('records the last added product for the notice', () => {
        const { result } = renderCart();

        act(() => result.current.addToCart(coffee));
        const first = result.current.lastAdded;
        act(() => result.current.addToCart(cookie));

        expect(first?.productName).toBe('Café coado');
        expect(result.current.lastAdded?.productName).toBe('Cookie de aveia');
        expect(result.current.lastAdded?.key).not.toBe(first?.key);
    });

    it('updates the cart with the current menu', () => {
        const { result } = renderCart();
        act(() => result.current.addToCart(coffee));
        act(() => result.current.addToCart(cookie));

        act(() => result.current.syncWithCatalog([{ ...coffee, price: 5 }]));

        expect(result.current.cart).toEqual([{ product: { ...coffee, price: 5 }, quantity: 1 }]);
        expect(result.current.totalPrice).toBe(5);
    });
});
