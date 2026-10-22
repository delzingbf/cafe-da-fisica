import { useId } from 'react';
import { useCart } from '../hooks/useCart';
import { useCheckoutForm } from '../hooks/useCheckoutForm';
import { formatPrice } from '../utils/formatPrice';
import { Dialog } from './Dialog';
import { CheckoutForm } from './CheckoutForm';
import './styles/CheckoutModal.css';

type Props = { 
    open: boolean; 
    onClose: () => void 
};

// Keep this component mounted so the form survives closing and reopening the dialog.
export function CheckoutModal({ open, onClose }: Props) {
    const titleId = useId();
    const form = useCheckoutForm();
    const { cart, totalPrice } = useCart();
    if (!open) return null;

    return (
        <Dialog labelledBy={titleId} className="checkout-modal" onClose={onClose}>
            <header className="checkout-header">
                <div><h2 id={titleId}>Confirmar pedido</h2><p>Confira seus itens e preencha os dados abaixo.</p></div>
                <button type="button" aria-label="Fechar checkout" onClick={onClose}>✕</button>
            </header>
            <details className="checkout-summary">
                <summary>Resumo do pedido · {formatPrice(totalPrice)}</summary>
                <ul>{cart.map(({ product, quantity }) => <li key={product.id}>
                    <span>{quantity} × {product.name}</span><span>{formatPrice(product.price * quantity)}</span>
                </li>)}</ul>
            </details>
            <CheckoutForm form={form} onBack={onClose} />
        </Dialog>
    );
}
