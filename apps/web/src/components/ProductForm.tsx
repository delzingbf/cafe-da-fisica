import { useId, useRef, useState, type FormEvent } from 'react';
import {
    PRODUCT_TYPES,
    type CreateProductRequest,
    type ProductResponse,
    type ProductType,
} from '@cafe-da-fisica/shared';
import { parsePrice, priceInputValue } from '../utils/parsePrice';
import { PRODUCT_TYPE_LABELS } from '../utils/productTypeLabels';
import './styles/ProductForm.css';

/** What the form produces: every field of a product, ready for `POST`/`PATCH /products`. */
export type ProductFormData = Required<CreateProductRequest>;

export interface ProductFormProps {
    /** The product being edited; omitted to create a new one. */
    product?: ProductResponse;
    onSubmit: (data: ProductFormData) => void;
    onCancel: () => void;
    /** While saving: the buttons are disabled. */
    busy?: boolean;
    /** Why the last save failed. */
    error?: string | null;
    /** Id for the title, so a dialog around the form can be named by it. */
    titleId?: string;
}

/** Create/edit form for a product. Checks the price itself; the rest is left to the browser and the API. */
export function ProductForm({
    product,
    onSubmit,
    onCancel,
    busy = false,
    error,
    titleId,
}: ProductFormProps) {
    const id = useId();
    const priceRef = useRef<HTMLInputElement>(null);
    const isEditing = product !== undefined;

    const [name, setName] = useState(product?.name ?? '');
    // Kept as typed ("4,50"), converted on submit; see parsePrice.
    const [price, setPrice] = useState(product ? priceInputValue(product.price) : '');
    const [priceError, setPriceError] = useState<string | null>(null);
    const [type, setType] = useState<ProductType | ''>(product?.type ?? '');
    const [vegan, setVegan] = useState(product?.vegan ?? false);
    const [available, setAvailable] = useState(product?.available ?? true);
    const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? '');
    // Not saved yet: the database has no column for it. Kept on screen until it does.
    const [quantityDiscount, setQuantityDiscount] = useState('');

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const parsedPrice = parsePrice(price);
        if (!parsedPrice.ok) {
            setPriceError(parsedPrice.error);
            priceRef.current?.focus();
            return;
        }
        // `required` on the select keeps it from being empty here.
        if (!type) return;

        onSubmit({
            name: name.trim(),
            price: parsedPrice.value,
            type,
            vegan,
            available,
            imageUrl: imageUrl.trim() || null,
        });
    };

    const field = (key: string) => `${id}-${key}`;
    const priceErrorId = field('price-error');

    return (
        <form onSubmit={handleSubmit} className="product-form-card">
            <h2 className="product-form__title" id={titleId}>
                {isEditing ? 'Editar Produto' : 'Adicionar Novo Produto'}
            </h2>

            <div className="product-form__group">
                <label className="product-form__label" htmlFor={field('name')}>
                    Nome
                </label>
                <input
                    id={field('name')}
                    type="text"
                    className="product-form__input"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ex: Café Expresso"
                    maxLength={100}
                    required
                />
            </div>

            <div className="product-form__group">
                <label className="product-form__label" htmlFor={field('price')}>
                    Preço (R$)
                </label>
                {/* Text, not type="number": Chromium drops a typed comma there, so "4,50" became 450. */}
                <input
                    ref={priceRef}
                    id={field('price')}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    className="product-form__input"
                    value={price}
                    onChange={(event) => {
                        setPrice(event.target.value);
                        setPriceError(null);
                    }}
                    placeholder="0,00"
                    required
                    aria-invalid={Boolean(priceError)}
                    aria-describedby={priceError ? priceErrorId : undefined}
                />
                {priceError && (
                    <span id={priceErrorId} className="product-form__error" role="alert">
                        {priceError}
                    </span>
                )}
            </div>

            <div className="product-form__group">
                <label className="product-form__label" htmlFor={field('type')}>
                    Tipo
                </label>
                <select
                    id={field('type')}
                    className="product-form__input"
                    value={type}
                    onChange={(event) => setType(event.target.value as ProductType | '')}
                    required
                >
                    <option value="" disabled>
                        Selecione o tipo
                    </option>
                    {PRODUCT_TYPES.map((productType) => (
                        <option key={productType} value={productType}>
                            {PRODUCT_TYPE_LABELS[productType]}
                        </option>
                    ))}
                </select>
            </div>

            <div className="product-form__group product-form__checkbox-wrapper">
                <label className="product-form__checkbox-label">
                    <input
                        type="checkbox"
                        checked={vegan}
                        onChange={(event) => setVegan(event.target.checked)}
                    />
                    Produto Vegano
                </label>
                <label className="product-form__checkbox-label">
                    <input
                        type="checkbox"
                        checked={available}
                        onChange={(event) => setAvailable(event.target.checked)}
                    />
                    Disponível para encomenda
                </label>
            </div>

            <div className="product-form__group">
                <label className="product-form__label" htmlFor={field('quantity-discount')}>
                    Desconto por quantidade
                </label>
                <input
                    id={field('quantity-discount')}
                    type="text"
                    className="product-form__input"
                    value={quantityDiscount}
                    onChange={(event) => setQuantityDiscount(event.target.value)}
                    placeholder="Ex: Leve 3 pague 2"
                />
            </div>

            <div className="product-form__group">
                <label className="product-form__label" htmlFor={field('image-url')}>
                    URL da Imagem
                </label>
                <input
                    id={field('image-url')}
                    type="url"
                    className="product-form__input"
                    value={imageUrl}
                    onChange={(event) => setImageUrl(event.target.value)}
                    placeholder="https://exemplo.com/imagem.png"
                    maxLength={2048}
                />
                {imageUrl.trim() && (
                    <div className="product-form__preview-box">
                        <span className="product-form__preview-text">Pré-visualização:</span>
                        <div className="product-form__preview-image-container">
                            {/* Remounted per URL, so an image hidden after an error comes back. */}
                            <img
                                key={imageUrl}
                                src={imageUrl.trim()}
                                alt="Pré-visualização do produto"
                                className="product-form__preview-img"
                                onError={(event) => {
                                    event.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <p className="product-form__error" role="alert">
                    {error}
                </p>
            )}

            <div className="product-form__actions">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={busy}
                    className="product-form__btn product-form__btn--secondary"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={busy}
                    className="product-form__btn product-form__btn--primary"
                >
                    {busy ? 'Salvando…' : isEditing ? 'Salvar Alterações' : 'Criar Produto'}
                </button>
            </div>
        </form>
    );
}
