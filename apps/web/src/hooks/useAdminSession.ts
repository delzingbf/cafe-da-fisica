import { useCallback, useEffect, useState } from 'react';
import type { AdminResponse, LoginRequest } from '@cafe-da-fisica/shared';
import { api } from '../api/client';

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
