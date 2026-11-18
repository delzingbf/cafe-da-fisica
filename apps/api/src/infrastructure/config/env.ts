import { z } from 'zod';

// Lets development and tests run without configuring a secret; rejected in production.
const DEVELOPMENT_JWT_SECRET = 'development-only-jwt-secret-do-not-use-in-production';

/** An optional string where empty (e.g. `SMTP_USER=` in .env) counts as unset. */
const optionalString = () =>
    z
        .string()
        .optional()
        .transform((value) => value || undefined);

// Every environment variable the API reads, with its type and default.
// Startup fails fast with a readable message if something is missing or malformed.
const envSchema = z
    .object({
        NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
        PORT: z.coerce.number().int().positive().default(3000),
        DATABASE_URL: z.url(),
        CORS_ORIGIN: z.string().default('http://localhost:5173'),
        // SMTP server for outgoing email, Gmail by default. Without SMTP_USER and SMTP_PASSWORD
        // (development, tests) emails are only logged. For Gmail, SMTP_PASSWORD is an app password.
        SMTP_HOST: z.string().default('smtp.gmail.com'),
        SMTP_PORT: z.coerce.number().int().positive().default(465),
        SMTP_USER: optionalString(),
        SMTP_PASSWORD: optionalString(),
        // Sender shown on outgoing emails. Defaults to "Café da Física <SMTP_USER>".
        EMAIL_FROM: optionalString(),
        // Signs the admin session cookie. Changing it logs every admin out.
        JWT_SECRET: z
            .string()
            .optional()
            .transform((value) => value || DEVELOPMENT_JWT_SECRET)
            .pipe(z.string().min(32)),
    })
    .refine((env) => Boolean(env.SMTP_USER) === Boolean(env.SMTP_PASSWORD), {
        message: 'Set both SMTP_USER and SMTP_PASSWORD, or neither',
        path: ['SMTP_PASSWORD'],
    })
    .refine((env) => env.NODE_ENV !== 'production' || env.SMTP_USER, {
        message: 'SMTP_USER and SMTP_PASSWORD are required in production',
        path: ['SMTP_USER'],
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
