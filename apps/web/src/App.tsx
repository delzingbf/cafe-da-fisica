import './App.css';
import { CatalogPage } from './pages/CatalogPage';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { Header } from './components/Header';
import { CartProvider } from './context/CartProvider';

export default function App() {
    return (
        <CartProvider>
            <div className="app">
                <Header>
                    <CartDrawer />
                </Header>
                <main className="app__main">
                    <CatalogPage />
                </main>
                <Footer />
            </div>
        </CartProvider>
    );
}
