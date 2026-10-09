import { useEffect, useState } from 'react';

export type CatalogView = 'grid' | 'list';

export const CATALOG_VIEW_STORAGE_KEY = 'cafe_da_fisica_catalog_view';

function loadView(): CatalogView {
    try {
        return localStorage.getItem(CATALOG_VIEW_STORAGE_KEY) === 'list' ? 'list' : 'grid';
    } catch {
        return 'grid';
    }
}

/** How the catalog shows products (cards or list), remembered in this browser. */
export function useCatalogView() {
    const [view, setView] = useState<CatalogView>(loadView);

    useEffect(() => {
        try {
            localStorage.setItem(CATALOG_VIEW_STORAGE_KEY, view);
        } catch {
            // Storage unavailable: the choice just lasts for this visit.
        }
    }, [view]);

    return [view, setView] as const;
}
