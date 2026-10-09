import './styles/CatalogPage.css';
import { useEffect } from 'react';
import type { ProductType } from '@cafe-da-fisica/shared';
import { CatalogViewToggle } from '../components/CatalogViewToggle';
import { ProductCard } from '../components/ProductCard';
import { ProductListItem } from '../components/ProductListItem';
import { useCart } from '../hooks/useCart';
import { useCatalogView } from '../hooks/useCatalogView';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useProducts } from '../hooks/useProducts';
import { ProductFilters } from '../components/ProductFilters';
import { useProductFilters } from '../hooks/useProductFilters';

// DICIONARIO CONVERSÃO PARA PT BR
// Phones only get the list view: cards are too cramped there.
const LIST_ONLY_QUERY = '(max-width: 600px)';

const TYPE_LABELS = {
    sweet: 'Doce',
    savory: 'Salgado',
    coffee: 'Café',
    other: 'Outros',
} satisfies Record<ProductType, string>;

export function CatalogPage() {
    const res = useProducts(); // pedindo os dados
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

    // Brings the saved cart up to date with the menu (prices, removed or unavailable products).
    const { syncWithCatalog } = useCart();
    useEffect(() => {
        if (res.kind === 'ready') syncWithCatalog(res.products);
    }, [res, syncWithCatalog]);

    if (res.kind === 'loading') {
        return <p role="status">Carregando os produtos…</p>;
    }

    if (res.kind === 'error') {
        return <p role="alert">Dados dos produtos não carregados.</p>;
    }

    // READY GARANTIDO
    if (res.products.length === 0) {
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
                {!listOnly && <CatalogViewToggle view={view} onViewChange={setView} />}
            </ProductFilters>

            {filteredProducts.length === 0 ? (
                <p className="catalog__empty" role="status">
                    Nenhum item correspondente encontrado. Tente outra busca ou altere os filtros.
                </p>
            ) : view === 'grid' ? (
                <div className="catalogo-grid">
                    {filteredProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            typeLabel={TYPE_LABELS[product.type]}
                        />
                    ))}
                </div>
            ) : (
                <ul className="catalogo-lista">
                    {filteredProducts.map((product) => (
                        <ProductListItem
                            key={product.id}
                            product={product}
                            typeLabel={TYPE_LABELS[product.type]}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
}
