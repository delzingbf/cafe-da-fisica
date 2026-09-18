import './App.css';
import { HomePage } from './pages/HomePage';

export default function App() {
  return (
    <div className="app">
      <header className="app__header">
        <h1>Café da Física</h1>
      </header>
      <main className="app__main">
        <HomePage />
      </main>
    </div>
  );
}
