import type { ValueTransformer } from 'typeorm';

// `pg` returns NUMERIC columns as strings to avoid precision loss. Prices in this app fit
// comfortably in a JS number (NUMERIC(10,2)), so expose them as numbers to the rest of the code.
export const decimalTransformer: ValueTransformer = {
    to: (value: number | null | undefined) => value,
    from: (value: string | null) => (value === null ? null : Number(value)),
};
