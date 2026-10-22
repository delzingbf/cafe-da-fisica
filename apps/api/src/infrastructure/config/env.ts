import { z } from 'zod';

// Lets development and tests run without configuring a secret; rejected in production.
const DEVELOPMENT_JWT_SECRET = 'development-only-jwt-secret-do-not-use-in-production';

// Every environment variable the API reads, with its type and default.
// Startup fails fast with a readable message if something is missing or malformed.
const envSchema = z
    .object({
        NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
        PORT: z.coerce.number().int().positive().default(3000),
        DATABASE_URL: z.url(),
        CORS_ORIGIN: z.string().default('http://localhost:5173'),
        // Resend (https://resend.com). Empty/unset outside production: emails are only logged.
        RESEND_API_KEY: z
            .string()
            .optional()
            .transform((value) => value || undefined),
        EMAIL_FROM: z.string().default('Café da Física <onboarding@resend.dev>'),
        // Signs the admin session cookie. Changing it logs every admin out.
        JWT_SECRET: z
            .string()
            .optional()
            .transform((value) => value || DEVELOPMENT_JWT_SECRET)
            .pipe(z.string().min(32)),
    })
    .refine((env) => env.NODE_ENV !== 'production' || env.RESEND_API_KEY, {
        message: 'RESEND_API_KEY is required in production',
        path: ['RESEND_API_KEY'],
    })
    .refine((env) => env.NODE_ENV !== 'production' || env.JWT_SECRET !== DEVELOPMENT_JWT_SECRET, {
        message: 'JWT_SECRET must be set in production',
        path: ['JWT_SECRET'],
    });

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
    const result = envSchema.safeParse(config);
    if (!result.success) {
        throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`);
    }
    return result.data;
}
