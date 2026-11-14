import { useEffect, useState } from 'react';
import type { OrderReportResponse } from '@cafe-da-fisica/shared';
import { ApiError, api } from '../api/client';

export type OrderReportState =
    | { kind: 'loading' }
    | { kind: 'ready'; report: OrderReportResponse }
    | { kind: 'error'; message: string };

function errorMessage(error: unknown): string {
    if (error instanceof ApiError && error.status === 401) {
        return 'Sua sessão expirou. Entre novamente para ver o relatório.';
    }
    return 'Não foi possível carregar o relatório. Verifique sua conexão e tente novamente.';
}

/** Fetches the admin report (`GET /api/orders/report`) once on mount. */
export function useOrderReport(): OrderReportState {
    const [state, setState] = useState<OrderReportState>({ kind: 'loading' });

    useEffect(() => {
        const controller = new AbortController();

        api.get<OrderReportResponse>('/orders/report', { signal: controller.signal })
            .then((report) => setState({ kind: 'ready', report }))
            .catch((error: unknown) => {
                if (!controller.signal.aborted) {
                    setState({ kind: 'error', message: errorMessage(error) });
                }
            });

        return () => controller.abort();
    }, []);

    return state;
}
