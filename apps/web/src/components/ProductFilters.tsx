import type { ProductResponse } from '@cafe-da-fisica/shared';
import { ProductTypePills } from './ProductTypePills';
import { VeganToggleFilter } from './VeganToggleFilter';
import { ProductSearchBar } from './ProductSearchBar';
import { useProductFilters } from '../hooks/useProductFilters';

type Props = {
    products: ProductResponse[];
};

export function ProductFilters({ products }: Props) {
    
    const {
        filteredProducts,
        selectedType,
        veganOnly,
        setSelectedType,
        setVeganOnly,
        searchInput,
        setSearchInput,
        setSearchQuery
    } = useProductFilters(products);

    console.log('Filtered products:', filteredProducts);

    return (
        <div className="product__filters">
            <ProductSearchBar
                searchInput={searchInput}
                onSearchInputChange={setSearchInput}
                onSearchQueryChange={setSearchQuery}
            />
            <ProductTypePills
                selectedType={selectedType}
                onTypeChange={setSelectedType}
            />
            <VeganToggleFilter
                veganOnly={veganOnly}
                onVeganChange={setVeganOnly}
            />
        </div>
    );
}