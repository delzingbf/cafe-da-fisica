import { useState } from 'react';
import type { ProductResponse } from '@cafe-da-fisica/shared';
import { formatPrice } from '../utils/formatPrice';
import { ProductModal } from './ProductModal';
import { VeganTag } from './VeganTag';
import './styles/ProductCard.css';

export interface ProductCardProps {
    product: ProductResponse;
    /** Category label shown in the modal (e.g. "Doce"). */
    typeLabel: string;
}

export function ProductCard({ product, typeLabel }: ProductCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="card-container">
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
                            onClick={() => setIsModalOpen(true)}
                        >
                            {product.name}
                        </button>
                    </h3>
                    <div className="card-preco-linha">
                        <p className="card-preco">{formatPrice(product.price)}</p>
                        {product.vegan && <VeganTag />}
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <ProductModal
                    product={product}
                    typeLabel={typeLabel}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    );
}
