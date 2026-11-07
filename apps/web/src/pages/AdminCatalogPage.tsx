import { useState } from 'react';
import type { ProductResponse } from '@cafe-da-fisica/shared';
import { ProductCatalog } from '../components/ProductCatalog';
import { ProductModal } from '../components/ProductModal';
import { ProductForm } from '../components/ProductForm';
import type { ProductFormData } from '../components/ProductForm';
import { useProducts } from '../hooks/useProducts';

/** The menu as the admin sees it: same catalog, and the pop-up shows details without the cart. */
export function AdminCatalogPage() {
    const res = useProducts();
    const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
    const [editingProduct, setEditingProduct] = useState<ProductFormData | null>(null);

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
        <ProductCatalog productsState={res} onSelectProduct={setSelectedProduct} />

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
        </>
    );
}
