import { useState } from 'react';
import type { ProductResponse } from '@cafe-da-fisica/shared';
import { ProductCatalog } from '../components/ProductCatalog';
import { ProductModal } from '../components/ProductModal';
import { useProducts } from '../hooks/useProducts';

/** The menu as the admin sees it: same catalog, and the pop-up shows details without the cart. */
export function AdminCatalogPage() {
    const res = useProducts();
    const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);

    return (
        <>
            <ProductCatalog productsState={res} onSelectProduct={setSelectedProduct} />

            {/* TODO: edit/remove buttons go here as children once the admin product routes exist. */}
            {selectedProduct && (
                <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
            )}
        </>
    );
}
