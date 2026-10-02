import './App.css';
import { HomePage } from './pages/HomePage';
import { ProductCard } from './components/ProductCard';

export default function App() {
  return (
    <div className="app">
      <header className="app__header">
        <h1>Café da Física</h1>
      </header>
      <main className="app__main">

        {/* CARDS */}
        <div className="catalogo-grid">
          <ProductCard nome="Pastel de Frango" isVegano={false} />
          <ProductCard nome="Pastel de Frango" isVegano={true} />
          <ProductCard nome="Pastel de Frango" isVegano={false} />
          <ProductCard nome="Pastel de Frango" isVegano={true} />
        </div>

      </main>
    </div>
  );
}
