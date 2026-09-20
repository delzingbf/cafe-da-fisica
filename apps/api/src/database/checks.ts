// SQL fragments for CHECK constraints reused by several entities.
// Column names are quoted so the expression matches what PostgreSQL stores.
export const EMAIL_CHECKS = {
    /** Loose shape check: something@something.something, no whitespace. */
    format: (column: string) => `"${column}" ~ '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$'`,
    /** Emails are stored lower-cased so lookups can be exact. */
    lowercase: (column: string) => `"${column}" = lower("${column}")`,
};
