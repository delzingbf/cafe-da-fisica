import type { ComponentType } from 'react';
import type { CatalogView } from '../hooks/useCatalogView';
import './styles/CatalogViewToggle.css';

type Props = {
    view: CatalogView;
    onViewChange: (view: CatalogView) => void;
};

const iconProps = {
    className: 'catalog-view-toggle__icon',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
} as const;

function GridIcon() {
    return (
        <svg {...iconProps}>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
    );
}

function ListIcon() {
    return (
        <svg {...iconProps}>
            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
    );
}

const options = [
    { value: 'grid', label: 'Cards', Icon: GridIcon },
    { value: 'list', label: 'Lista', Icon: ListIcon },
] satisfies { value: CatalogView; label: string; Icon: ComponentType }[];

export function CatalogViewToggle({ view, onViewChange }: Props) {
    return (
        <div className="catalog-view-toggle" role="group" aria-label="Visualização dos produtos">
            {options.map(({ value, label, Icon }) => (
                <button
                    key={value}
                    type="button"
                    className="catalog-view-toggle__option"
                    aria-pressed={view === value}
                    onClick={() => onViewChange(value)}
                >
                    <Icon />
                    {label}
                </button>
            ))}
        </div>
    );
}
