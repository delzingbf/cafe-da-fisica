<<<<<<< Updated upstream
=======
import { useState } from 'react';
>>>>>>> Stashed changes
import './App.css';
import './AdminApp.css';
import { AdminMenu } from './components/AdminMenu';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { LoginDialog } from './components/LoginDialog';
import { ProductForm } from './components/ProductForm';
import type { ProductFormData } from './components/ProductForm';
import { useAdminSection } from './hooks/useAdminSection';
import { useAdminSession } from './hooks/useAdminSession';
import { AdminCatalogPage } from './pages/AdminCatalogPage';
import { AdminComingSoonPage } from './pages/AdminComingSoonPage';
import type { ProductResponse } from '@cafe-da-fisica/shared';
import { AdminSettingsPage } from './pages/AdminSettingsPage';

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

    // Estados para controlar o formulário e qual produto está a ser editado
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductFormData | undefined>(undefined);

    // Abrir formulário para CRIAR novo produto
    const handleOpenCreate = () => {
        setEditingProduct(undefined); // Limpa para vir vazio
        setIsFormOpen(true);
    };

    // Abrir formulário para EDITAR um produto existente ao clicar nele no catálogo
    const handleSelectProduct = (product: ProductResponse) => {
        setEditingProduct({
            name: product.name,
            price: product.price,
            type: product.type,
            isVegan: product.vegan,
            quantityDiscount: '', // Preenche com vazio caso não venha da API
            imageUrl: '',         // Preenche com vazio caso não venha da API
        });
        setIsFormOpen(true);
    };

    const handleSaveProduct = (data: ProductFormData) => {
        if (editingProduct) {
            console.log('Produto atualizado:', data);
            alert(`Produto "${data.name}" atualizado com sucesso! (Simulação)`);
        } else {
            console.log('Novo produto criado:', data);
            alert(`Produto "${data.name}" criado com sucesso! (Simulação)`);
        }
        setIsFormOpen(false);
        setEditingProduct(undefined);
    };

    return (
        <div className="app">
        <Header
        subtitle="Painel Administrador"
        start={loggedIn && <AdminMenu current={section} onNavigate={navigate} />}
        >
        {loggedIn && (
            <div className="admin-actions">
            {section === 'catalog' && !isFormOpen && (
                <button className="admin-actions__add" onClick={handleOpenCreate}>
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
        {isFormOpen ? (
            <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <ProductForm
            initialData={editingProduct}
            onSubmit={handleSaveProduct}
            onCancel={() => {
                setIsFormOpen(false);
                setEditingProduct(undefined);
            }}
            isEditing={!!editingProduct}
            />
            </div>
        ) : (
            <>
            {section === 'catalog' && (
                <AdminCatalogPage onSelectProduct={handleSelectProduct} />
            )}
            {section === 'report' && (
                <AdminComingSoonPage
                title="Relatório"
                description="Aqui vão aparecer os relatórios de pedidos e vendas."
                />
            )}
            {section === 'settings' && <AdminSettingsPage />
            }
            </>     
        )}
        </main>

        <Footer />

        {session.kind === 'anonymous' && <LoginDialog onLogin={login} />}
        </div>
    );
}
