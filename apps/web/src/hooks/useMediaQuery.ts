import { useCallback, useSyncExternalStore } from 'react';

/** Whether a CSS media query matches, e.g. `useMediaQuery('(max-width: 600px)')`. Updates live. */
export function useMediaQuery(query: string): boolean {
    const subscribe = useCallback(
        (onChange: () => void) => {
            if (typeof window.matchMedia !== 'function') return () => {};
            const list = window.matchMedia(query);
            list.addEventListener('change', onChange);
            return () => list.removeEventListener('change', onChange);
        },
        [query],
    );

    // `matchMedia` is missing in some environments (e.g. jsdom in tests): treat as "no match".
    const getSnapshot = () =>
        typeof window.matchMedia === 'function' && window.matchMedia(query).matches;

    return useSyncExternalStore(subscribe, getSnapshot);
}
