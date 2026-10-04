import type { ProductResponse, ProductType } from '@cafe-da-fisica/shared';
import { useState } from 'react';

export function useProductFilters(products: ProductResponse[]) {
    // const products: ProductResponse[] = useProducts().products || [];
    const [selectedType, setSelectedType] = useState<ProductType | null>(null);
    const [veganOnly, setVeganOnly] = useState(false);

    const filteredProducts: ProductResponse[] = products.filter(
        (product) => 
        (!selectedType || product.type === selectedType) &&
        (!veganOnly || product.vegan)
    );

    return { 
        filteredProducts,
        selectedType,
        setSelectedType,
        veganOnly,
        setVeganOnly 
    };
}