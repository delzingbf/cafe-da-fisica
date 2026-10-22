import type { ProductResponse } from '@cafe-da-fisica/shared';
import { formatPrice } from '../utils/formatPrice';
import { VeganTag } from './VeganTag';
import './styles/ProductCard.css';

export interface ProductCardProps {
    product: ProductResponse;
    /** Opens the product's details (the page owns the pop-up). */
    onOpen: () => void;
}

export function ProductCard({ product, onOpen }: ProductCardProps) {
    return (
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
                        onClick={onOpen}
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
    );
}
