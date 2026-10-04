import type { ProductResponse, ProductType } from '@cafe-da-fisica/shared';
import { useState } from 'react';

export function useProductFilters(products: ProductResponse[]) {
    // const products: ProductResponse[] = useProducts().products || [];
    const [selectedType, setSelectedType] = useState<ProductType | null>(null);
    const [veganOnly, setVeganOnly] = useState(false);

    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    // const normalizedQuery = searchQuery.trim().toLowerCase();
    const normalizedQuery = normalizeText(searchQuery.trim());

    const filteredProducts: ProductResponse[] = products.filter(
        (product) => 
        (!selectedType || product.type === selectedType) &&
        (!veganOnly || product.vegan) &&
        normalizeText(product.name).includes(normalizedQuery)
    );

    return { 
        filteredProducts,
        selectedType,
        setSelectedType,
        veganOnly,
        setVeganOnly,
        searchInput,
        setSearchInput,
        setSearchQuery,
    };
}

function normalizeText(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}