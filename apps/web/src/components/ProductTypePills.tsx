import type { ProductType } from '@cafe-da-fisica/shared';
import './ProductTypePills.css';

type Props = {
    selectedType: ProductType | null;
    onTypeChange: (type: ProductType | null) => void;
};

const options = [
    { value: null, label: 'Todos' },
    { value: 'sweet', label: 'Doces' },
    { value: 'savory', label: 'Salgados' },
    { value: 'coffee', label: 'Cafés' },
    { value: 'other', label: 'Outros' },
] satisfies { value: ProductType | null; label: string }[];

export function ProductTypePills({ selectedType, onTypeChange }: Props) {
    return (
        <div className="product-type-pills" role="group" aria-label="Tipo de produto">
            {options.map(({ value, label }) => (
                <button
                    key={value ?? 'all'}
                    type="button"
                    className={`product-type-pills__pill product-type-pills__pill--${value ?? 'all'}`}
                    aria-pressed={selectedType === value}
                    onClick={() => onTypeChange(selectedType === value ? null : value)}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}
