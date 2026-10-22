import './App.css';
import './AdminApp.css';
import { AdminMenu } from './components/AdminMenu';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { LoginDialog } from './components/LoginDialog';
import { useAdminSection } from './hooks/useAdminSection';
import { useAdminSession } from './hooks/useAdminSession';
import { AdminCatalogPage } from './pages/AdminCatalogPage';
import { AdminComingSoonPage } from './pages/AdminComingSoonPage';

function PlusIcon() {
    return (
        <svg
            className="admin-actions__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
        >
            <path d="M12 5v14M5 12h14" />
        </svg>
    );
}

// Admin panel at /admin (see Root.tsx): the public menu with admin actions in the header, and a
// side menu to the other admin pages. Until someone logs in, a login card covers the page. The
// menu behind it is public anyway; what actually protects admin data is the API, which checks the
// session on every admin route.
export default function AdminApp() {
    const { session, login, logout } = useAdminSession();
    const [section, navigate] = useAdminSection();
    const loggedIn = session.kind === 'authenticated';

    return (
        <div className="app">
            <Header
                subtitle="Painel Administrador"
                start={loggedIn && <AdminMenu current={section} onNavigate={navigate} />}
            >
                {loggedIn && (
                    <div className="admin-actions">
                        {section === 'catalog' && (
                            // TODO: open the product form once POST /api/admin/products exists.
                            <button className="admin-actions__add" disabled title="Em breve">
                                <PlusIcon />
                                Adicionar Produto
                            </button>
                        )}
                        <button className="admin-actions__logout" onClick={() => void logout()}>
                            Sair
                        </button>
                    </div>
                )}
            </Header>
            <main className="app__main">
                {section === 'catalog' && <AdminCatalogPage />}
                {section === 'report' && (
                    <AdminComingSoonPage
                        title="Relatório"
                        description="Aqui vão aparecer os relatórios de pedidos e vendas."
                    />
                )}
                {section === 'settings' && (
                    <AdminComingSoonPage
                        title="Configurações"
                        description="Aqui vai ser possível ajustar o site, como o e-mail que recebe os avisos de novos pedidos."
                    />
                )}
            </main>
            <Footer />

            {session.kind === 'anonymous' && <LoginDialog onLogin={login} />}
        </div>
    );
}
