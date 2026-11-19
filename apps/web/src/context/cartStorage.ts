import type { ProductResponse } from '@cafe-da-fisica/shared';
import type { CartItem } from './cartContext';

export const CART_STORAGE_KEY = 'cafe_da_fisica_cart';

function isCartItem(value: unknown): value is CartItem {
    if (typeof value !== 'object' || value === null) return false;
    const { product, quantity } = value as Record<string, unknown>;
    if (typeof product !== 'object' || product === null) return false;
    const { id, name, price } = product as Record<string, unknown>;
    return (
        typeof id === 'number' &&
        typeof name === 'string' &&
        typeof price === 'number' &&
        Number.isInteger(quantity) &&
        (quantity as number) > 0
    );
}

// The saved cart is a snapshot: prices may be stale until `syncCart` runs, and the order total
// must always come from the API.
export function loadCart(): CartItem[] {
    try {
        const parsed: unknown = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? '[]');
        return Array.isArray(parsed) ? parsed.filter(isCartItem) : [];
    } catch {
        return [];
    }
}

function sameProduct(a: ProductResponse, b: ProductResponse): boolean {
    const keys = Object.keys(a) as (keyof ProductResponse)[];
    return keys.length === Object.keys(b).length && keys.every((key) => a[key] === b[key]);
}

/**
 * Replaces each saved product with its current version from the menu (new price, name, …) and
 * drops products that left the menu or became unavailable. Returns `cart` itself when nothing
 * changed, so React skips the re-render.
 */
export function syncCart(cart: CartItem[], products: ProductResponse[]): CartItem[] {
    const byId = new Map(products.map((product) => [product.id, product]));
    const synced = cart.flatMap((item) => {
        const product = byId.get(item.product.id);
        return product?.available ? [{ ...item, product }] : [];
    });
    const unchanged =
        synced.length === cart.length &&
        synced.every((item, index) => sameProduct(item.product, cart[index].product));
    return unchanged ? cart : synced;
}
