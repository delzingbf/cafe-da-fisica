import type { ReactNode } from 'react';
import type { ProductResponse } from '@cafe-da-fisica/shared';
import { formatPrice } from '../utils/formatPrice';
import { VeganTag } from './VeganTag';
import './styles/ProductCard.css';

export interface ProductCardProps {
    product: ProductResponse;
    /** Opens the product's details (the page owns the pop-up). */
    onOpen: () => void;
    /** Buttons in the card's corner, shown on hover (e.g. the admin's "remove"). */
    actions?: ReactNode;
    /** Removed from the menu: the card is faded and labelled "Removido" (admin only). */
    archived?: boolean;
}

export function ProductCard({ product, onOpen, actions, archived = false }: ProductCardProps) {
    return (
        <div className={`card-container${archived ? ' card-container--arquivado' : ''}`}>
            {/* AQUI IREMOS COLOCAR A FOTO */}
            <div className="card-foto" aria-hidden="true">
                📷
            </div>

            <div className="card-info">
                <h3 className="card-titulo">
                    {/* Its ::after covers the whole card: the card is clickable and reachable with Tab. */}
                    <button
                        type="button"
                        className="card-abrir"
                        aria-haspopup="dialog"
                        onClick={onOpen}
                    >
                        {product.name}
                    </button>
                </h3>
                <div className="card-preco-linha">
                    <p className="card-preco">{formatPrice(product.price)}</p>
                    {product.vegan && <VeganTag />}
                </div>
                {archived && <p className="card-removido">Removido</p>}
            </div>

            {actions && <div className="card-acoes">{actions}</div>}
        </div>
    );
}
