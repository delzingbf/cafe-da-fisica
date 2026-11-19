import type { ReactNode } from 'react';
import type { ProductResponse } from '@cafe-da-fisica/shared';
import { formatPrice } from '../utils/formatPrice';
import { VeganTag } from './VeganTag';
import './styles/ProductListItem.css';

export interface ProductListItemProps {
    product: ProductResponse;
    /** Opens the product's details (the page owns the pop-up). */
    onOpen: () => void;
    /** Buttons at the end of the row, shown on hover (e.g. the admin's "remove"). */
    actions?: ReactNode;
    /** Removed from the menu: the row is faded and labelled "Removido" (admin only). */
    archived?: boolean;
}

/** One row of the catalog's list view: photo, name, vegan tag and price. Render inside a <ul>. */
export function ProductListItem({
    product,
    onOpen,
    actions,
    archived = false,
}: ProductListItemProps) {
    return (
        <li className={`product-row${archived ? ' product-row--arquivado' : ''}`}>
            {/* AQUI IREMOS COLOCAR A FOTO */}
            <div className="product-row__foto" aria-hidden="true">
                📷
            </div>

            <h3 className="product-row__nome">
                {/* Its ::after covers the whole row: the row is clickable and reachable with Tab. */}
                <button
                    type="button"
                    className="product-row__abrir"
                    aria-haspopup="dialog"
                    onClick={onOpen}
                >
                    {product.name}
                </button>
            </h3>
            {product.vegan && <VeganTag />}
            {archived && <p className="product-row__removido">Removido</p>}
            <p className="product-row__preco">{formatPrice(product.price)}</p>
            {actions && <div className="product-row__acoes">{actions}</div>}
        </li>
    );
}
