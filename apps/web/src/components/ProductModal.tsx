import { useId } from 'react';
import type { ProductResponse } from '@cafe-da-fisica/shared';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/formatPrice';
import { Dialog } from './Dialog';
import { VeganTag } from './VeganTag';
import './ProductModal.css';

export interface ProductModalProps {
    product: ProductResponse;
    /** Category label (e.g. "Doce"). */
    typeLabel: string;
    onClose: () => void;
}

/** Product details pop-up with the "add to cart" button. Render it only while open. */
export function ProductModal({ product, typeLabel, onClose }: ProductModalProps) {
    const { addToCart } = useCart();
    const titleId = useId();

    const handleAddToCart = () => {
        addToCart(product);
        onClose();
    };

    return (
        <Dialog onClose={onClose} labelledBy={titleId} className="modal-content">
            <button className="botao-fechar" aria-label="Fechar" onClick={onClose}>
                X
            </button>

            <div className="modal-cabecalho">
                <h2 id={titleId}>{product.name}</h2>
                <p className="modal-tipo">Categoria: {typeLabel}</p>
                {product.vegan && <VeganTag />}
            </div>
            <p className="modal-preco">{formatPrice(product.price)}</p>

            <button
                className="botao-adicionar"
                disabled={!product.available}
                onClick={handleAddToCart}
            >
                {product.available ? 'Adicionar no carrinho' : 'Indisponível'}
            </button>
        </Dialog>
    );
}
