import './App.css';
import { useProducts } from './hooks/useProducts';
import { useProductFilters } from './hooks/useProductFilters';
import { ProductTypePills } from './components/ProductTypePills';
import { VeganToggleFilter } from './components/VeganToggleFilter';
import { ProductSearchBar } from './components/ProductSearchBar';
import { HomePage } from './pages/HomePage';

export default function App() {

    // TEST
    const res = useProducts();
    const products = res.kind === 'ready' ? res.products : [];

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
        <div className="app">
            <header className="app__header">
                <h1>Café da Física</h1>
            </header>
            <main className="app__main">
                <HomePage />
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
            </main>
        </div>
    );
}
