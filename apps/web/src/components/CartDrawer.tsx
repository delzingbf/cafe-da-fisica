import { useId, useState } from 'react';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/formatPrice';
import { Dialog } from './Dialog';
import './CartDrawer.css';

// Drawn with `currentColor`, so it follows the button's text color (unlike an emoji).
function CartIcon() {
    return (
        <svg
            className="cart-drawer__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>
    );
}

export function CartDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    const titleId = useId();
    const { cart, lastAdded, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } =
        useCart();

    return (
        <>
            <button className="cart-drawer__toggle" onClick={() => setIsOpen(true)}>
                <CartIcon />
                Carrinho
                {/* A new key on every add remounts the count, which replays the bump animation. */}
                <span
                    key={lastAdded?.key ?? 0}
                    className={`cart-drawer__count${lastAdded ? ' cart-drawer__count--bump' : ''}`}
                >
                    ({totalItems})
                </span>
            </button>

            {/* Always mounted, so screen readers announce each new message. */}
            <div className="cart-toast-region" role="status" aria-live="polite">
                {lastAdded && (
                    <p key={lastAdded.key} className="cart-toast">
                        {lastAdded.productName} adicionado ao carrinho
                    </p>
                )}
            </div>

            {isOpen && (
                <Dialog
                    placement="end"
                    labelledBy={titleId}
                    className="cart-drawer"
                    onClose={() => setIsOpen(false)}
                >
                    <div className="cart-drawer__header">
                        <h2 id={titleId}>Seu carrinho</h2>
                        <button
                            className="cart-drawer__icon-button"
                            aria-label="Fechar carrinho"
                            onClick={() => setIsOpen(false)}
                        >
                            ✕
                        </button>
                    </div>

                    {cart.length === 0 ? (
                        <p className="cart-drawer__empty">O carrinho está vazio.</p>
                    ) : (
                        <>
                            <ul className="cart-drawer__items">
                                {cart.map(({ product, quantity }) => (
                                    <li key={product.id} className="cart-drawer__item">
                                        <div>
                                            <strong>{product.name}</strong>
                                            <div className="cart-drawer__item-price">
                                                {formatPrice(product.price)}
                                            </div>
                                        </div>
                                        <div className="cart-drawer__item-controls">
                                            <button
                                                className="cart-drawer__icon-button"
                                                aria-label={`Diminuir quantidade de ${product.name}`}
                                                onClick={() =>
                                                    updateQuantity(product.id, quantity - 1)
                                                }
                                            >
                                                −
                                            </button>
                                            <span aria-label={`Quantidade de ${product.name}`}>
                                                {quantity}
                                            </span>
                                            <button
                                                className="cart-drawer__icon-button"
                                                aria-label={`Aumentar quantidade de ${product.name}`}
                                                onClick={() =>
                                                    updateQuantity(product.id, quantity + 1)
                                                }
                                            >
                                                +
                                            </button>
                                            <button
                                                className="cart-drawer__icon-button"
                                                aria-label={`Remover ${product.name} do carrinho`}
                                                onClick={() => removeFromCart(product.id)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <div className="cart-drawer__footer">
                                <h3>Subtotal: {formatPrice(totalPrice)}</h3>
                                <button className="cart-drawer__clear" onClick={clearCart}>
                                    Esvaziar carrinho
                                </button>
                                {/* TODO: enable once the checkout flow (POST /api/orders) exists. */}
                                <button className="cart-drawer__checkout" disabled>
                                    Finalizar pedido
                                </button>
                            </div>
                        </>
                    )}
                </Dialog>
            )}
        </>
    );
}
