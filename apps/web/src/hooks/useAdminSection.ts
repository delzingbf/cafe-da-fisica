import { useCallback, useEffect, useState } from 'react';

export type AdminSection = 'catalog' | 'report' | 'settings';

/** URL of each admin page. Anything else under /admin opens the catalog. */
export const ADMIN_SECTION_PATHS = {
    catalog: '/admin',
    report: '/admin/relatorio',
    settings: '/admin/configuracoes',
} satisfies Record<AdminSection, string>;

function sectionFromPath(pathname: string): AdminSection {
    const path = pathname.replace(/\/+$/, '');
    const match = Object.entries(ADMIN_SECTION_PATHS).find(
        ([, sectionPath]) => sectionPath === path,
    );
    return match ? (match[0] as AdminSection) : 'catalog';
}

/**
 * The admin page being shown, kept in the URL: reloading stays on the same page and the browser's
 * back/forward buttons work. Navigating swaps the page without reloading the app.
 */
export function useAdminSection(): [AdminSection, (section: AdminSection) => void] {
    const [section, setSection] = useState(() => sectionFromPath(window.location.pathname));

    useEffect(() => {
        const onPopState = () => setSection(sectionFromPath(window.location.pathname));
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, []);

    const navigate = useCallback((next: AdminSection) => {
        const path = ADMIN_SECTION_PATHS[next];
        if (window.location.pathname !== path) window.history.pushState(null, '', path);
        setSection(next);
        window.scrollTo(0, 0);
    }, []);

    return [section, navigate];
}
