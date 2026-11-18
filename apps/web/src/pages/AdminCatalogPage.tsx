import { useEffect, useState } from 'react';
import type { ProductResponse } from '@cafe-da-fisica/shared';
import { ApiError, api } from '../api/client';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ProductCatalog } from '../components/ProductCatalog';
import { ProductModal } from '../components/ProductModal';
import { ProductForm } from '../components/ProductForm';
import type { ProductFormData } from '../components/ProductForm';
import { useProducts } from '../hooks/useProducts';
import './styles/AdminCatalogPage.css';

// Drawn with `currentColor`, so it follows the button's text color.
function TrashIcon() {
    return (
        <svg
            className="admin-catalog__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" />
        </svg>
    );
}

function actionErrorMessage(error: unknown, action: 'remover' | 'restaurar'): string {
    if (error instanceof ApiError && error.status === 401) {
        return 'Sua sessão expirou. Entre de novo para continuar.';
    }
    return `Não foi possível ${action}. Verifique sua conexão e tente de novo.`;
}

/** Short message at the bottom of the screen. `key` changes on every message, replaying it. */
interface Notice {
    key: number;
    text: string;
}

const nextNotice = (previous: Notice | null, text: string): Notice => ({
    key: (previous?.key ?? 0) + 1,
    text,
});

/**
 * The menu as the admin sees it: same catalog, a pop-up with "Editar Produto", a trash button on
 * each product and "Mostrar removidos" to bring removed products back. Removing only hides the
 * product (see ProductsService.archive in the API), so past orders keep pointing to it.
 */
export function AdminCatalogPage() {
    // Bumped after a remove/restore so the lists are fetched again.
    const [version, setVersion] = useState(0);
    const res = useProducts(version);
    const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
    const [editingProduct, setEditingProduct] = useState<ProductFormData | null>(null);

    const [showArchived, setShowArchived] = useState(false);
    const [archived, setArchived] = useState<ProductResponse[]>([]);
    const [productToRemove, setProductToRemove] = useState<ProductResponse | null>(null);
    const [removing, setRemoving] = useState(false);
    const [removeError, setRemoveError] = useState<string | null>(null);
    const [notice, setNotice] = useState<Notice | null>(null);

    const showNotice = (text: string) => setNotice((previous) => nextNotice(previous, text));

    // Removed products are admin-only, so they are fetched only while "Mostrar removidos" is on.
    useEffect(() => {
        if (!showArchived) return;
        const controller = new AbortController();

        api.get<ProductResponse[]>('/products/archived', { signal: controller.signal })
            .then(setArchived)
            .catch(() => {
                if (!controller.signal.aborted) {
                    setNotice((previous) =>
                        nextNotice(previous, 'Não foi possível carregar os produtos removidos.'),
                    );
                }
            });

        return () => controller.abort();
    }, [showArchived, version]);

    const archivedIds = new Set(showArchived ? archived.map((product) => product.id) : []);
    // The catalog gets the menu plus, with "Mostrar removidos" on, the removed products.
    const productsState =
        res.kind === 'ready' && showArchived
            ? {
                  kind: 'ready' as const,
                  products: [...res.products, ...archived].sort((a, b) =>
                      a.name.localeCompare(b.name, 'pt-BR'),
                  ),
              }
            : res;

    const openRemove = (product: ProductResponse) => {
        setRemoveError(null);
        setProductToRemove(product);
    };

    const closeRemove = () => {
        setProductToRemove(null);
        setRemoveError(null);
    };

    const confirmRemove = async () => {
        if (!productToRemove) return;
        setRemoving(true);
        setRemoveError(null);
        try {
            await api.delete<void>(`/products/${productToRemove.id}`);
            showNotice(`${productToRemove.name} removido do cardápio`);
            setProductToRemove(null);
            setVersion((v) => v + 1);
        } catch (error) {
            setRemoveError(actionErrorMessage(error, 'remover'));
        } finally {
            setRemoving(false);
        }
    };

    // No confirmation: restoring can always be undone by removing again.
    const restore = async (product: ProductResponse) => {
        try {
            await api.post<void>(`/products/${product.id}/restore`, {});
            showNotice(`${product.name} restaurado no cardápio`);
            setVersion((v) => v + 1);
        } catch (error) {
            showNotice(actionErrorMessage(error, 'restaurar'));
        }
    };

    const renderActions = (product: ProductResponse) =>
        archivedIds.has(product.id) ? (
            <button
                type="button"
                className="admin-catalog__restore"
                onClick={() => void restore(product)}
            >
                Restaurar
            </button>
        ) : (
            <button
                type="button"
                className="admin-catalog__remove"
                aria-label={`Remover ${product.name}`}
                title="Remover do cardápio"
                onClick={() => openRemove(product)}
            >
                <TrashIcon />
            </button>
        );

    // Quando clica em "Editar" no modal de detalhes
    const handleStartEdit = (product: ProductResponse) => {
        setSelectedProduct(null); // Fecha o modal de visualização
        setEditingProduct({
            name: product.name,
            price: product.price,
            type: product.type,
            isVegan: product.vegan,
            quantityDiscount: '', // Preenche com o que vier ou vazio
            imageUrl: '',         // Preenche com o que vier ou vazio
        });
    };

    const handleSaveEdit = (data: ProductFormData) => {
        console.log('Produto editado:', data);
        alert(`Produto "${data.name}" atualizado com sucesso! (Simulação)`);
        setEditingProduct(null);
    };

    return (
        <>
        <ProductCatalog
            productsState={productsState}
            onSelectProduct={setSelectedProduct}
            renderActions={renderActions}
            isArchived={(product) => archivedIds.has(product.id)}
            toolbar={
                <button
                    type="button"
                    className="admin-catalog__archived-toggle"
                    aria-pressed={showArchived}
                    onClick={() => setShowArchived((on) => !on)}
                >
                    Mostrar removidos
                </button>
            }
        />

        {/* Modal de visualização padrão do projeto */}
        {selectedProduct && (
            <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)}>
            {/* Botão de edição encaixado exatamente onde o repositório previa */}
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
            type="button"
            onClick={() => handleStartEdit(selectedProduct)}
            style={{
                padding: '8px 16px',
                backgroundColor: 'var(--color-accent)',
                             color: 'white',
                             border: 'none',
                             borderRadius: '8px',
                             cursor: 'pointer',
                             fontWeight: 'bold'
            }}
            >
            Editar Produto
            </button>
            </div>
            </ProductModal>
        )}

        {/* Formulário de edição aberto quando o admin clica em editar */}
        {editingProduct && (
            <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '20px'
            }}>
            <ProductForm
            initialData={editingProduct}
            onSubmit={handleSaveEdit}
            onCancel={() => setEditingProduct(null)}
            isEditing={true}
            />
            </div>
        )}

        {productToRemove && (
            <ConfirmDialog
                title="Remover produto"
                confirmLabel="Remover"
                busy={removing}
                error={removeError}
                onConfirm={() => void confirmRemove()}
                onCancel={closeRemove}
            >
                <p>Remover “{productToRemove.name}” do cardápio?</p>
                <p>
                    Ele deixa de aparecer para os clientes. Você pode restaurar depois em “Mostrar
                    removidos”.
                </p>
            </ConfirmDialog>
        )}

        {/* Always mounted, so screen readers announce each new message. */}
        <div className="admin-catalog__toast-region" role="status" aria-live="polite">
            {notice && (
                <p key={notice.key} className="admin-catalog__toast">
                    {notice.text}
                </p>
            )}
        </div>
        </>
    );
}
