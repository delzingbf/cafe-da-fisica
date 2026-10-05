import './CatalogPage.css';
import type { ProductType } from '@cafe-da-fisica/shared';
import { ProductCard } from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { ProductFilters } from '../components/ProductFilters';

// DICIONARIO CONVERSÃO PARA PT BR
const TYPE_LABELS = {
    sweet: 'Doce',
    savory: 'Salgado',
    coffee: 'Café',
    other: 'Outros',
} satisfies Record<ProductType, string>;

export function CatalogPage() {
    const res = useProducts(); // pedindo os dados

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
                products={res.products}
            />

            <div className="catalogo-grid">
                {res.products.map((product) => (
                    <ProductCard
                        key={product.id}
                        nome={product.name}
                        preco={product.price}
                        isVegano={product.vegan}
                        tipo={TYPE_LABELS[product.type]}
                    />
                ))}
            </div>
        </div>
    );
}
