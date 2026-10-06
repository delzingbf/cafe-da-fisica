import type { ProductType } from '@cafe-da-fisica/shared';
import { ProductTypePills } from './ProductTypePills';
import { VeganToggleFilter } from './VeganToggleFilter';
import { ProductSearchBar } from './ProductSearchBar';

type Props = {
    selectedType: ProductType | null; 
    veganOnly: boolean;
    setSelectedType: (type: ProductType | null) => void;
    setVeganOnly: (veganOnly: boolean) => void;
    searchInput: string;
    setSearchInput: (searchInput: string) => void;
    setSearchQuery: (searchQuery: string) => void;
};

export function ProductFilters({ 
    selectedType, 
    veganOnly, 
    setSelectedType, 
    setVeganOnly, 
    searchInput, 
    setSearchInput, 
    setSearchQuery 
}: Props) {
    
    // const {
    //     filteredProducts,
    //     selectedType,
    //     veganOnly,
    //     setSelectedType,
    //     setVeganOnly,
    //     searchInput,
    //     setSearchInput,
    //     setSearchQuery
    // } = useProductFilters(products);

    // console.log('Filtered products:', filteredProducts);

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