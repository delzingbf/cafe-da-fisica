import type { ReactNode } from 'react';
import type { ProductType } from '@cafe-da-fisica/shared';
import { ProductTypePills } from './ProductTypePills';
import { VeganToggleFilter } from './VeganToggleFilter';
import { ProductSearchBar } from './ProductSearchBar';
import './styles/ProductFilters.css';

type Props = {
    selectedType: ProductType | null;
    veganOnly: boolean;
    setSelectedType: (type: ProductType | null) => void;
    setVeganOnly: (veganOnly: boolean) => void;
    searchInput: string;
    setSearchInput: (searchInput: string) => void;
    setSearchQuery: (searchQuery: string) => void;
    /** Extra controls shown at the right end of the filter row (e.g. the cards/list toggle). */
    children?: ReactNode;
};

export function ProductFilters({
    selectedType,
    veganOnly,
    setSelectedType,
    setVeganOnly,
    searchInput,
    setSearchInput,
    setSearchQuery,
    children,
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
            <div className="product__filters-row">
                <ProductTypePills selectedType={selectedType} onTypeChange={setSelectedType} />
                <VeganToggleFilter veganOnly={veganOnly} onVeganChange={setVeganOnly} />
                {children && <div className="product__filters-end">{children}</div>}
            </div>
        </div>
    );
}
