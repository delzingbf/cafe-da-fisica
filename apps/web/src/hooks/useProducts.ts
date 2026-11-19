import { useEffect, useState } from 'react';
import type { ProductResponse } from '@cafe-da-fisica/shared';
import { api } from '../api/client';

export type ProductsState =
    | { kind: 'loading' }
    | { kind: 'ready'; products: ProductResponse[] }
    | { kind: 'error'; message: string };

/**
 * Fetches the menu (`GET /api/products`) on mount, and again whenever `version` changes (e.g. after
 * the admin removes a product). While refetching, the previous list stays on screen.
 */
export function useProducts(version = 0): ProductsState {
    const [state, setState] = useState<ProductsState>({ kind: 'loading' });

    useEffect(() => {
        const controller = new AbortController();

        api.get<ProductResponse[]>('/products', { signal: controller.signal })
            .then((products) => setState({ kind: 'ready', products }))
            .catch((error: unknown) => {
                if (controller.signal.aborted) return;
                setState({
                    kind: 'error',
                    message: error instanceof Error ? error.message : String(error),
                });
            });

        return () => controller.abort();
    }, [version]);

    return state;
}
