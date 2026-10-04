import './ProductSearchBar.css';

type Props = {
    searchInput: string;
    onSearchInputChange: (input: string) => void;
    onSearchQueryChange: (query: string) => void;
};

export function ProductSearchBar({
    searchInput,
    onSearchInputChange,
    onSearchQueryChange,
}: Props) {
    return (
        <form
            className="product-search-bar"
            role="search"
            onSubmit={(event) => {
                event.preventDefault();
                onSearchQueryChange(searchInput.trim());
            }}
        >
            <button type="submit" aria-label="Pesquisar produtos">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="10" cy="10" r="6" />
                    <path d="m15 15 5 5" />
                </svg>
            </button>
            <input
                type="search"
                aria-label="Nome do produto"
                placeholder="Pesquisar produtos..."
                value={searchInput}
                onChange={(event) => onSearchInputChange(event.target.value)}
            />
        </form>
    );
}
