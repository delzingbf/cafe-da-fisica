import './CatalogPage.css';
import type { ProductType } from '@cafe-da-fisica/shared';
import { ProductCard } from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { ProductFilters } from '../components/ProductFilters';
import { useProductFilters } from '../hooks/useProductFilters';

// DICIONARIO CONVERSÃO PARA PT BR
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
        <div className="catalog__filters">
            <ProductFilters 
                selectedType={selectedType}
                veganOnly={veganOnly}
                setSelectedType={setSelectedType}
                setVeganOnly={setVeganOnly}
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                setSearchQuery={setSearchQuery}
            />

            <div className="catalogo-grid">
                {filteredProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        name={product.name}
                        price={product.price}
                        isVegan={product.vegan}
                        type={TYPE_LABELS[product.type]}
                    />
                ))}
            </div>
        </div>
    );
}
