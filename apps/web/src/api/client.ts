import { API_PREFIX } from '@cafe-da-fisica/shared';

const baseUrl = (import.meta.env.VITE_API_URL ?? `/${API_PREFIX}`).replace(/\/$/, '');

export class ApiError extends Error {
    readonly status: number;
    /** Parsed JSON body of the error response, or `undefined` when it had none. */
    readonly body: unknown;

    constructor(status: number, message: string, body?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.body = body;
    }
}

type UnauthorizedListener = (path: string) => void;
const unauthorizedListeners = new Set<UnauthorizedListener>();

/**
 * Calls `listener` with the path of every request answered with 401, e.g. to notice that the admin
 * session expired while the page was open. Returns a function that stops listening.
 */
export function onUnauthorized(listener: UnauthorizedListener): () => void {
    unauthorizedListeners.add(listener);
    return () => {
        unauthorizedListeners.delete(listener);
    };
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers: { 'Content-Type': 'application/json', ...init.headers },
    });

    if (!response.ok) {
        // Nest answers errors with a JSON body; anything else (e.g. a proxy's HTML page) is dropped.
        const body: unknown = await response.json().catch(() => undefined);
        if (response.status === 401) unauthorizedListeners.forEach((listener) => listener(path));
        throw new ApiError(
            response.status,
            `${init.method ?? 'GET'} ${path} failed (${response.status})`,
            body,
        );
    }
    // 204 No Content (e.g. POST /auth/logout) has no body to parse.
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
}

/** Thin typed wrapper around fetch for talking to the NestJS API. */
export const api = {
    get: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: 'GET' }),
    post: <T>(path: string, body: unknown, init?: RequestInit) =>
        request<T>(path, { ...init, method: 'POST', body: JSON.stringify(body) }),
    patch: <T>(path: string, body: unknown, init?: RequestInit) =>
        request<T>(path, { ...init, method: 'PATCH', body: JSON.stringify(body) }),
    put: <T>(path: string, body: unknown, init?: RequestInit) =>
        request<T>(path, { ...init, method: 'PUT', body: JSON.stringify(body) }),
    delete: <T>(path: string, init?: RequestInit) =>
        request<T>(path, { ...init, method: 'DELETE' }),
};
