import { useContext } from 'react';
import { CartContext, type CartContextValue } from '../context/cartContext';

/** Reads the shopping cart. Must be used inside `<CartProvider>`. */
export function useCart(): CartContextValue {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used inside a CartProvider');
    }
    return context;
}
