import { useState } from 'react';
import type { ProductResponse } from '@cafe-da-fisica/shared';
import { formatPrice } from '../utils/formatPrice';
import { ProductModal } from './ProductModal';
import { VeganTag } from './VeganTag';
import './styles/ProductListItem.css';

export interface ProductListItemProps {
    product: ProductResponse;
    /** Category label shown in the modal (e.g. "Doce"). */
    typeLabel: string;
}

/** One row of the catalog's list view: photo, name, vegan tag and price. Render inside a <ul>. */
export function ProductListItem({ product, typeLabel }: ProductListItemProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <li className="product-row">
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
                    onClick={() => setIsModalOpen(true)}
                >
                    {product.name}
                </button>
            </h3>
            {product.vegan && <VeganTag />}
            <p className="product-row__preco">{formatPrice(product.price)}</p>

            {isModalOpen && (
                <ProductModal
                    product={product}
                    typeLabel={typeLabel}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </li>
    );
}
