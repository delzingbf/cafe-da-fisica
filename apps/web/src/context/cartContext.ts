import { createContext } from 'react';
import type { ProductResponse } from '@cafe-da-fisica/shared';

export interface CartItem {
    product: ProductResponse;
    quantity: number;
}

/** The last product added, for the "added to cart" notice. `key` changes on every add. */
export interface CartAddedNotice {
    key: number;
    productName: string;
}

export interface CartContextValue {
    cart: CartItem[];
    lastAdded: CartAddedNotice | null;
    addToCart: (product: ProductResponse) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    /** Refreshes the saved items with the current menu (see `syncCart`). */
    syncWithCatalog: (products: ProductResponse[]) => void;
    totalItems: number;
    totalPrice: number;
}

export const CartContext = createContext<CartContextValue | undefined>(undefined);
