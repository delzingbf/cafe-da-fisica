import './styles/ProductCatalog.css';
import type { ReactNode } from 'react';
import type { ProductResponse } from '@cafe-da-fisica/shared';
import { CatalogViewToggle } from './CatalogViewToggle';
import { ProductCard } from './ProductCard';
import { ProductFilters } from './ProductFilters';
import { ProductListItem } from './ProductListItem';
import { useCatalogView } from '../hooks/useCatalogView';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useProductFilters } from '../hooks/useProductFilters';
import type { ProductsState } from '../hooks/useProducts';

// Phones only get the list view: cards are too cramped there.
const LIST_ONLY_QUERY = '(max-width: 600px)';

export interface ProductCatalogProps {
    /** What `useProducts()` returned. */
    productsState: ProductsState;
    /** Called when a product's card or row is clicked; the page decides what opens. */
    onSelectProduct: (product: ProductResponse) => void;
    /** Buttons for each product, shown on its card or row (the admin's "remove"/"restore"). */
    renderActions?: (product: ProductResponse) => ReactNode;
    /** Products shown faded and labelled "Removido" (admin, "Mostrar removidos"). */
    isArchived?: (product: ProductResponse) => boolean;
    /** Extra controls in the filter row, before the cards/list toggle (e.g. "Mostrar removidos"). */
    toolbar?: ReactNode;
}

/**
 * The menu: loading and error messages, filters, the cards/list toggle and the products.
 * Shared by the customer catalog and the admin panel, which add their own actions around it.
 */
export function ProductCatalog({
    productsState: res,
    onSelectProduct,
    renderActions,
    isArchived,
    toolbar,
}: ProductCatalogProps) {
    const products = res.kind === 'ready' ? res.products : [];

    const {
        filteredProducts,
        selectedType,
        veganOnly,
        setSelectedType,
        setVeganOnly,
        searchInput,
        setSearchInput,
        setSearchQuery,
    } = useProductFilters(products);
    const [savedView, setView] = useCatalogView();
    const listOnly = useMediaQuery(LIST_ONLY_QUERY);
    // The saved choice is kept, so it comes back on a wider screen.
    const view = listOnly ? 'list' : savedView;

    if (res.kind === 'loading') {
        return <p role="status">Carregando os produtos…</p>;
    }

    if (res.kind === 'error') {
        return <p role="alert">Dados dos produtos não carregados.</p>;
    }

    // READY GARANTIDO
    // With a toolbar (admin) the filters stay, so "Mostrar removidos" is reachable even with an
    // empty menu.
    if (res.products.length === 0 && !toolbar) {
        return <p>Nenhum produto disponível.</p>;
    }

    // PAGINA DOS ITENS
    return (
        <div className="catalog__page">
            <ProductFilters
                selectedType={selectedType}
                veganOnly={veganOnly}
                setSelectedType={setSelectedType}
                setVeganOnly={setVeganOnly}
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                setSearchQuery={setSearchQuery}
            >
                {(toolbar || !listOnly) && (
                    <div className="catalog__toolbar">
                        {toolbar}
                        {!listOnly && <CatalogViewToggle view={view} onViewChange={setView} />}
                    </div>
                )}
            </ProductFilters>

            {res.products.length === 0 ? (
                <p className="catalog__empty" role="status">
                    Nenhum produto disponível.
                </p>
            ) : filteredProducts.length === 0 ? (
                <p className="catalog__empty" role="status">
                    Nenhum item correspondente encontrado. Tente outra busca ou altere os filtros.
                </p>
            ) : view === 'grid' ? (
                <div className="catalogo-grid">
                    {filteredProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onOpen={() => onSelectProduct(product)}
                            actions={renderActions?.(product)}
                            archived={isArchived?.(product)}
                        />
                    ))}
                </div>
            ) : (
                <ul className="catalogo-lista">
                    {filteredProducts.map((product) => (
                        <ProductListItem
                            key={product.id}
                            product={product}
                            onOpen={() => onSelectProduct(product)}
                            actions={renderActions?.(product)}
                            archived={isArchived?.(product)}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
}
