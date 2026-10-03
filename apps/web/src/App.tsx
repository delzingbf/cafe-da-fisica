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
          <ProductCard isVegano={false} nome="Pastel de Frango" preco={7.50} tipo="Salgado"/>
          <ProductCard isVegano={true} nome="Pastel de Frango" preco={7.50} tipo="Salgado"/>
          <ProductCard isVegano={false} nome="Pastel de Frango" preco={7.50} tipo="Salgado"/>
          <ProductCard isVegano={true} nome="Café" preco={2.50} tipo="Bebida"/>
          <ProductCard isVegano={false} nome="Pastel de Frango" preco={7.50} tipo="Salgado"/>
          <ProductCard isVegano={false} nome="Bolo de Cenoura" preco={7.50} tipo="Doce"/>
        </div>

      </main>
    </div>
  );
}
