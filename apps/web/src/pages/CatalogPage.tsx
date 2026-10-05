import './CatalogPage.css';
import type { ProductType } from '@cafe-da-fisica/shared';
import { ProductCard } from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';

// DICIONARIO CONVERSÃO PARA PT BR
const TYPE_LABELS = {
    sweet: 'Doce',
    savory: 'Salgado',
    coffee: 'Café',
    other: 'Outros',
} satisfies Record<ProductType, string>;

export function CatalogPage() {
    const state = useProducts(); // pedindo os dados

    if (state.kind === 'loading') {
        return <p role="status">Carregando os produtos…</p>;
    }

    if (state.kind === 'error') {
        return <p role="alert">Dados dos produtos não carregados.</p>;
    }

    // READY GARANTIDO
    if (state.products.length === 0) {
        return <p>Nenhum produto disponível.</p>;
    }

    // PAGINA DOS ITENS
    return (
        <div className="catalogo-grid">
            {state.products.map((product) => (
                <ProductCard
                    key={product.id}
                    nome={product.name}
                    preco={product.price}
                    isVegano={product.vegan}
                    tipo={TYPE_LABELS[product.type]}
                />
            ))}
        </div>
    );
}
