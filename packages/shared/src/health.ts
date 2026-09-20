/** Response body of `GET /api/health`. */
export interface HealthResponse {
    /** `ok` when every dependency is reachable, `degraded` otherwise. */
    status: 'ok' | 'degraded';
    database: 'up' | 'down';
    /** Seconds since the API process started. */
    uptime: number;
    /** ISO-8601 timestamp of when the check ran. */
    timestamp: string;
}
