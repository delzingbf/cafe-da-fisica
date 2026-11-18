import { useEffect, useId, useState } from 'react';
import type { ProductResponse } from '@cafe-da-fisica/shared';
import { ApiError, api } from '../api/client';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Dialog } from '../components/Dialog';
import { ProductCatalog } from '../components/ProductCatalog';
import { ProductForm, type ProductFormData } from '../components/ProductForm';
import { ProductModal } from '../components/ProductModal';
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

function actionErrorMessage(error: unknown, action: 'remover' | 'restaurar' | 'salvar'): string {
    if (error instanceof ApiError && error.status === 401) {
        return 'Sua sessão expirou. Entre de novo para continuar.';
    }
    if (action === 'salvar' && error instanceof ApiError && error.status === 400) {
        return 'Confira os dados do produto e tente de novo.';
    }
    if (error instanceof ApiError && error.status === 404) {
        return 'Este produto não existe mais. Atualize a página.';
    }
    return `Não foi possível ${action}. Verifique sua conexão e tente de novo.`;
}

/** The product form: empty to create, or filled with the product being edited. */
type FormTarget = { kind: 'create' } | { kind: 'edit'; product: ProductResponse };

export interface AdminCatalogPageProps {
    /** "Adicionar Produto" (in the header, owned by AdminApp) was clicked. */
    isCreating?: boolean;
    /** The create form closed, saved or cancelled. */
    onCreateClose?: () => void;
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
export function AdminCatalogPage({ isCreating = false, onCreateClose }: AdminCatalogPageProps) {
    // Bumped after a remove/restore so the lists are fetched again.
    const [version, setVersion] = useState(0);
    const res = useProducts(version);
    const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
    const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const formTitleId = useId();

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

    // Editing wins over creating: the create form only opens from the header, outside any pop-up.
    const formTarget: FormTarget | null = editingProduct
        ? { kind: 'edit', product: editingProduct }
        : isCreating
          ? { kind: 'create' }
          : null;

    const startEdit = (product: ProductResponse) => {
        setSelectedProduct(null);
        setSaveError(null);
        setEditingProduct(product);
    };

    const closeForm = () => {
        setSaveError(null);
        if (editingProduct) setEditingProduct(null);
        else onCreateClose?.();
    };

    const saveProduct = async (data: ProductFormData) => {
        if (!formTarget) return;
        setSaving(true);
        setSaveError(null);
        try {
            if (formTarget.kind === 'edit') {
                await api.patch<ProductResponse>(`/products/${formTarget.product.id}`, data);
                showNotice(`${data.name} atualizado`);
            } else {
                await api.post<ProductResponse>('/products', data);
                showNotice(`${data.name} adicionado ao cardápio`);
            }
            closeForm();
            setVersion((v) => v + 1);
        } catch (error) {
            setSaveError(actionErrorMessage(error, 'salvar'));
        } finally {
            setSaving(false);
        }
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

            {selectedProduct && (
                <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)}>
                    <button
                        type="button"
                        className="botao-adicionar"
                        onClick={() => startEdit(selectedProduct)}
                    >
                        Editar Produto
                    </button>
                </ProductModal>
            )}

            {/* Not dismissible by Esc or a click outside, so a typed form is not lost by accident. */}
            {formTarget && (
                <Dialog
                    labelledBy={formTitleId}
                    dismissible={false}
                    size="wide"
                    className="admin-catalog__form"
                >
                    <ProductForm
                        // A new form for each product, so it starts from that product's values.
                        key={formTarget.kind === 'edit' ? formTarget.product.id : 'new'}
                        product={formTarget.kind === 'edit' ? formTarget.product : undefined}
                        titleId={formTitleId}
                        busy={saving}
                        error={saveError}
                        onSubmit={(data) => void saveProduct(data)}
                        onCancel={closeForm}
                    />
                </Dialog>
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
                        Ele deixa de aparecer para os clientes. Você pode restaurar depois em
                        “Mostrar removidos”.
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
