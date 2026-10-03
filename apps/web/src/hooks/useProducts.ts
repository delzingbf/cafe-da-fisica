import { useEffect, useState } from 'react';
import type { ProductResponse } from '@cafe-da-fisica/shared';
import { api } from '../api/client';

type State =
    | { kind: 'loading' }
    | { kind: 'ready'; products: ProductResponse[] }
    | { kind: 'error'; message: string };

/** Fetches the menu (`GET /api/products`) once on mount. */
export function useProducts(): State {
    const [state, setState] = useState<State>({ kind: 'loading' });

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
    }, []);

    return state;
}
