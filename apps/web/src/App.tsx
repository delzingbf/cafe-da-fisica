import './App.css';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { Footer } from './components/Footer';

export default function App() {

    // TEST
    // const res = useProducts();
    // const products = res.kind === 'ready' ? res.products : [];

    
    return (
        <div className="app">
            <header className="app__header" id="top">
                <h1>Café da Física</h1>
            </header>
            <main className="app__main">
                <CatalogPage />
                <Footer />
            </main>
        </div>
    );
}
