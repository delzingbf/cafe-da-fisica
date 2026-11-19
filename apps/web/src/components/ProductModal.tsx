import { useId, type ReactNode } from 'react';
import type { ProductResponse } from '@cafe-da-fisica/shared';
import { formatPrice } from '../utils/formatPrice';
import { PRODUCT_TYPE_LABELS } from '../utils/productTypeLabels';
import { Dialog } from './Dialog';
import { VeganTag } from './VeganTag';
import './styles/ProductModal.css';

export interface ProductModalProps {
    product: ProductResponse;
    onClose: () => void;
    /** Actions under the price (e.g. the customer's "add to cart" button). */
    children?: ReactNode;
}

/** Product details pop-up. The page passes its own actions as children. Render it only while open. */
export function ProductModal({ product, onClose, children }: ProductModalProps) {
    const titleId = useId();

    return (
        <Dialog onClose={onClose} labelledBy={titleId} className="modal-content">
            <button className="botao-fechar" aria-label="Fechar" onClick={onClose}>
                X
            </button>

            <div className="modal-cabecalho">
                <h2 id={titleId}>{product.name}</h2>
                <p className="modal-tipo">Categoria: {PRODUCT_TYPE_LABELS[product.type]}</p>
                {product.vegan && <VeganTag />}
            </div>
            <p className="modal-preco">{formatPrice(product.price)}</p>

            {children}
        </Dialog>
    );
}
