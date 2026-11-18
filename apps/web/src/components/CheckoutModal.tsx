import { useId } from 'react';
import { useCart } from '../hooks/useCart';
import { useCheckoutForm } from '../hooks/useCheckoutForm';
import { formatPrice } from '../utils/formatPrice';
import { Dialog } from './Dialog';
import { CheckoutForm } from './CheckoutForm';
import './styles/CheckoutModal.css';

type Props = {
    open: boolean;
    onClose: () => void;
};

// Keep this component mounted so the form survives closing and reopening the dialog.
export function CheckoutModal({ open, onClose }: Props) {
    const titleId = useId();
    const form = useCheckoutForm();
    const { cart, totalPrice } = useCart();
    if (!open) return null;

    const { status } = form;

    // Once the order is placed, closing starts a fresh one for the next visit.
    function handleClose() {
        if (status.kind === 'success') form.reset();
        onClose();
    }

    if (status.kind === 'success') {
        return (
            <Dialog labelledBy={titleId} className="checkout-modal" onClose={handleClose}>
                <header className="checkout-header">
                    <div>
                        <h2 id={titleId}>Pedido #{status.order.id} recebido!</h2>
                        <p>
                            Enviamos a confirmação para o seu e-mail. Total:{' '}
                            {formatPrice(status.order.total)}.
                        </p>
                    </div>
                    <button type="button" aria-label="Fechar" onClick={handleClose}>
                        ✕
                    </button>
                </header>
                <div className="checkout-actions checkout-actions--end">
                    <button type="button" className="checkout-primary" onClick={handleClose}>
                        Fechar
                    </button>
                </div>
            </Dialog>
        );
    }

    return (
        <Dialog labelledBy={titleId} className="checkout-modal" onClose={handleClose}>
            <header className="checkout-header">
                <div>
                    <h2 id={titleId}>Confirmar pedido</h2>
                    <p>Confira seus itens e preencha os dados abaixo.</p>
                </div>
                <button type="button" aria-label="Fechar checkout" onClick={handleClose}>
                    ✕
                </button>
            </header>
            <details className="checkout-summary">
                <summary>Resumo do pedido · {formatPrice(totalPrice)}</summary>
                <ul>
                    {cart.map(({ product, quantity }) => (
                        <li key={product.id}>
                            <span>
                                {quantity} × {product.name}
                            </span>
                            <span>{formatPrice(product.price * quantity)}</span>
                        </li>
                    ))}
                </ul>
            </details>
            <CheckoutForm form={form} onBack={handleClose} />
        </Dialog>
    );
}
