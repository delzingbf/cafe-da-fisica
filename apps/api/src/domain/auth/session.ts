import type { Request } from 'express';
import type { Admin } from '../admins/admin.entity.js';

/** httpOnly cookie that carries the signed session token. */
export const SESSION_COOKIE = 'admin_session';

/** How long a login lasts, for both the token and the cookie. */
export const SESSION_TTL_SECONDS = 8 * 60 * 60;

/** Claims inside the session token. `sub` is the admin id (JWT requires a string). */
export interface SessionPayload {
    sub: string;
}

/** A request that went through AdminGuard. */
export interface AuthenticatedRequest extends Request {
    admin: Admin;
}
