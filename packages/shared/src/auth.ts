// Admin authentication. The session itself travels in an httpOnly cookie, never in these bodies.

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AdminResponse {
    id: number;
    email: string;
}
