import './App.css';
import { CatalogPage } from './pages/CatalogPage';

export default function App() {
    return (
        <div className="app">
            <header className="app__header">
                <h1>Café da Física</h1>
            </header>
            <main className="app__main">
                <CatalogPage />
            </main>
        </div>
    );
}
