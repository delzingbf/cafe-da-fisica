import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { ProductResponse } from '@cafe-da-fisica/shared';
import {
    CartContext,
    type CartAddedNotice,
    type CartContextValue,
    type CartItem,
} from './cartContext';
import { CART_STORAGE_KEY, loadCart, syncCart } from './cartStorage';

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>(loadCart);
    const [lastAdded, setLastAdded] = useState<CartAddedNotice | null>(null);

    useEffect(() => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        } catch {
            // Storage unavailable (private mode, quota): the cart still works for this session.
        }
    }, [cart]);

    // Only use state setters, so they never change and consumers' effects don't re-run.
    const actions = useMemo(() => {
        const removeFromCart = (productId: number) =>
            setCart((prev) => prev.filter((item) => item.product.id !== productId));

        return {
            addToCart: (product: ProductResponse) => {
                if (!product.available) return;
                setCart((prev) =>
                    prev.some((item) => item.product.id === product.id)
                        ? prev.map((item) =>
                              item.product.id === product.id
                                  ? { ...item, quantity: item.quantity + 1 }
                                  : item,
                          )
                        : [...prev, { product, quantity: 1 }],
                );
                setLastAdded((prev) => ({ key: (prev?.key ?? 0) + 1, productName: product.name }));
            },
            removeFromCart,
            updateQuantity: (productId: number, quantity: number) => {
                if (quantity <= 0) {
                    removeFromCart(productId);
                    return;
                }
                setCart((prev) =>
                    prev.map((item) =>
                        item.product.id === productId ? { ...item, quantity } : item,
                    ),
                );
            },
            clearCart: () => setCart([]),
            syncWithCatalog: (products: ProductResponse[]) =>
                setCart((prev) => syncCart(prev, products)),
        };
    }, []);

    const value = useMemo<CartContextValue>(
        () => ({
            ...actions,
            cart,
            lastAdded,
            totalItems: cart.reduce((acc, item) => acc + item.quantity, 0),
            totalPrice: cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
        }),
        [actions, cart, lastAdded],
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
