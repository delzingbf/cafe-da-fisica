import './App.css';
import { CatalogPage } from './pages/CatalogPage';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CartProvider } from './context/CartProvider';

export default function App() {
    return (
        <CartProvider>
            <div className="app">
                <header className="app__header" id="top">
                    <h1>Café da Física</h1>
                    <CartDrawer />
                </header>
                <main className="app__main">
                    <CatalogPage />
                </main>
                <Footer />
            </div>
        </CartProvider>
    );
}
