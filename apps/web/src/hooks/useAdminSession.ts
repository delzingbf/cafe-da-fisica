import { useCallback, useEffect, useState } from 'react';
import type { AdminResponse, LoginRequest } from '@cafe-da-fisica/shared';
import { ApiError, api, onUnauthorized } from '../api/client';

export type AdminSession =
    { kind: 'checking' } | { kind: 'anonymous' } | { kind: 'authenticated'; admin: AdminResponse };

/**
 * Admin login state. The session lives in an httpOnly cookie the page cannot read, so on mount
 * it asks the API (`GET /api/auth/me`) whether there is one.
 */
export function useAdminSession() {
    const [session, setSession] = useState<AdminSession>({ kind: 'checking' });

    useEffect(() => {
        const controller = new AbortController();

        api.get<AdminResponse>('/auth/me', { signal: controller.signal })
            .then((admin) => setSession({ kind: 'authenticated', admin }))
            // 401 (no session) or the API is unreachable: either way, ask for a login.
            .catch(() => {
                if (!controller.signal.aborted) setSession({ kind: 'anonymous' });
            });

        return () => controller.abort();
    }, []);

    // A 401 from an admin route usually means the session expired while the page was open, but not
    // always: a wrong current password in "Trocar senha" is a 401 too. So ask the API again, and
    // only show the login when the session is really gone.
    useEffect(
        () =>
            onUnauthorized((path) => {
                if (path.startsWith('/auth/me') || path.startsWith('/auth/login')) return;
                api.get<AdminResponse>('/auth/me').catch((error: unknown) => {
                    if (error instanceof ApiError && error.status === 401) {
                        setSession({ kind: 'anonymous' });
                    }
                });
            }),
        [],
    );

    /** Rejects with an ApiError on failure: 401 wrong email/password, 429 too many attempts. */
    const login = useCallback(async (credentials: LoginRequest) => {
        const admin = await api.post<AdminResponse>('/auth/login', credentials);
        setSession({ kind: 'authenticated', admin });
    }, []);

    const logout = useCallback(async () => {
        // Logged out locally even if the request fails; the cookie then expires on its own.
        await api.post<void>('/auth/logout', {}).catch(() => {});
        setSession({ kind: 'anonymous' });
    }, []);

    return { session, login, logout };
}
