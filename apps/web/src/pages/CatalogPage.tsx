import { useEffect, useState } from 'react';
import type { ProductResponse } from '@cafe-da-fisica/shared';
import { ProductCatalog } from '../components/ProductCatalog';
import { ProductModal } from '../components/ProductModal';
import { useCart } from '../hooks/useCart';
import { useProducts } from '../hooks/useProducts';

/** The customer's menu: clicking a product opens its pop-up with "add to cart". */
export function CatalogPage() {
    const res = useProducts(); // pedindo os dados
    const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
    const { addToCart, syncWithCatalog } = useCart();

    // Brings the saved cart up to date with the menu (prices, removed or unavailable products).
    useEffect(() => {
        if (res.kind === 'ready') syncWithCatalog(res.products);
    }, [res, syncWithCatalog]);

    const closeModal = () => setSelectedProduct(null);

    return (
        <>
            <ProductCatalog productsState={res} onSelectProduct={setSelectedProduct} />

            {selectedProduct && (
                <ProductModal product={selectedProduct} onClose={closeModal}>
                    <button
                        className="botao-adicionar"
                        disabled={!selectedProduct.available}
                        onClick={() => {
                            addToCart(selectedProduct);
                            closeModal();
                        }}
                    >
                        {selectedProduct.available ? 'Adicionar no carrinho' : 'Indisponível'}
                    </button>
                </ProductModal>
            )}
        </>
    );
}
