import './App.css';
import { useProducts } from './hooks/useProducts';
import { HomePage } from './pages/HomePage';
import { ProductFilters } from './components/ProductFilters';
import { CatalogPage } from './pages/CatalogPage';

export default function App() {

    // TEST
    const res = useProducts();
    const products = res.kind === 'ready' ? res.products : [];

    
    return (
        <div className="app">
            <header className="app__header">
                <h1>Café da Física</h1>
            </header>
            <main className="app__main">
                <CatalogPage />
            </main>
            <div className="app__catalog__filter">
                <ProductFilters 
                    products={products}
                />
            </div>
        </div>
    );
}
