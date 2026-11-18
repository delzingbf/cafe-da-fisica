import React, { useState } from 'react';
import { parsePrice, priceInputValue } from '../utils/parsePrice';
import './styles/ProductForm.css';

export interface ProductFormData {
    name: string;
    price: number | '';
    type: string;
    isVegan: boolean;
    quantityDiscount: string;
    imageUrl: string;
}

interface ProductFormProps {
    initialData?: ProductFormData;
    onSubmit: (data: ProductFormData) => void;
    onCancel?: () => void;
    isEditing?: boolean;
}

export function ProductForm({
    initialData,
    onSubmit,
    onCancel,
    isEditing = false,
}: ProductFormProps) {
    const [name, setName] = useState(initialData?.name || '');
    // Kept as typed ("4,50"), converted on submit; see parsePrice.
    const [price, setPrice] = useState(
        typeof initialData?.price === 'number' ? priceInputValue(initialData.price) : '',
    );
    const [priceError, setPriceError] = useState<string | null>(null);
    const [type, setType] = useState(initialData?.type || '');
    const [isVegan, setIsVegan] = useState(initialData?.isVegan ?? false);
    const [quantityDiscount, setQuantityDiscount] = useState(
        initialData?.quantityDiscount || ''
    );
    const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const parsedPrice = parsePrice(price);
        if (!parsedPrice.ok) {
            setPriceError(parsedPrice.error);
            document.getElementById('price')?.focus();
            return;
        }
        onSubmit({
            name,
            price: parsedPrice.value,
                 type,
                 isVegan,
                 quantityDiscount,
                 imageUrl,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="product-form-card">
        <h2 className="product-form__title">
        {isEditing ? 'Editar Produto' : 'Adicionar Novo Produto'}
        </h2>

        <div className="product-form__group">
        <label className="product-form__label" htmlFor="name">Nome</label>
        <input
        id="name"
        type="text"
        className="product-form__input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ex: Café Expresso"
        required
        />
        </div>

        <div className="product-form__group">
        <label className="product-form__label" htmlFor="price">Preço (R$)</label>
        {/* Text, not type="number": Chromium drops a typed comma there, so "4,50" became 450. */}
        <input
        id="price"
        type="text"
        inputMode="decimal"
        autoComplete="off"
        className="product-form__input"
        value={price}
        onChange={(e) => {
            setPrice(e.target.value);
            setPriceError(null);
        }}
        placeholder="0,00"
        required
        aria-invalid={Boolean(priceError)}
        aria-describedby={priceError ? 'price-error' : undefined}
        />
        {priceError && (
            <span id="price-error" className="product-form__error" role="alert">
            {priceError}
            </span>
        )}
        </div>

        <div className="product-form__group">
        <label className="product-form__label" htmlFor="type">Tipo</label>
        <input
        id="type"
        type="text"
        className="product-form__input"
        value={type}
        onChange={(e) => setType(e.target.value)}
        placeholder="Ex: Bebidas, Sobremesas"
        required
        />
        </div>

        <div className="product-form__group product-form__checkbox-wrapper">
        <label className="product-form__checkbox-label">
        <input
        type="checkbox"
        checked={isVegan}
        onChange={(e) => setIsVegan(e.target.checked)}
        />
        Produto Vegano
        </label>
        </div>

        <div className="product-form__group">
        <label className="product-form__label" htmlFor="quantityDiscount">Desconto por quantidade</label>
        <input
        id="quantityDiscount"
        type="text"
        className="product-form__input"
        value={quantityDiscount}
        onChange={(e) => setQuantityDiscount(e.target.value)}
        placeholder="Ex: Leve 3 pague 2"
        />
        </div>

        <div className="product-form__group">
        <label className="product-form__label" htmlFor="imageUrl">URL da Imagem </label>
        <input
        id="imageUrl"
        type="url"
        className="product-form__input"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="https://exemplo.com/imagem.png"
        />
        {imageUrl && (
            <div className="product-form__preview-box">
            <span className="product-form__preview-text">Pré-visualização:</span>
            <div className="product-form__preview-image-container">
            <img
            src={imageUrl}
            alt="Preview do produto"
            className="product-form__preview-img"
            onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
            }}
            />
            </div>
            </div>
        )}
        </div>

        <div className="product-form__actions">
        {onCancel && (
            <button type="button" onClick={onCancel} className="product-form__btn product-form__btn--secondary">
            Cancelar
            </button>
        )}
        <button type="submit" className="product-form__btn product-form__btn--primary">
        {isEditing ? 'Salvar Alterações' : 'Criar Produto'}
        </button>
        </div>
        </form>
    );
}
