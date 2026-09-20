import { z } from 'zod';

// Every environment variable the API reads, with its type and default.
// Startup fails fast with a readable message if something is missing or malformed.
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.url(),
    CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
    const result = envSchema.safeParse(config);
    if (!result.success) {
        throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`);
    }
    return result.data;
}
