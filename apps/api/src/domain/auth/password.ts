import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto';

// Hashes are stored as `scrypt$<N>$<r>$<p>$<salt>$<key>` (salt and key in base64url). Keeping the
// parameters in the string lets the cost be raised later without invalidating existing hashes.
const PREFIX = 'scrypt';
const COST: Required<Pick<ScryptOptions, 'N' | 'r' | 'p'>> = { N: 2 ** 15, r: 8, p: 1 };
const SALT_BYTES = 16;
const KEY_BYTES = 64;

function deriveKey(password: string, salt: Buffer, cost: typeof COST): Promise<Buffer> {
    // scrypt needs 128 * N * r bytes; Node's default limit (32 MiB) is exactly that, so allow headroom.
    const options: ScryptOptions = { ...cost, maxmem: 256 * cost.N * cost.r };
    return new Promise((resolve, reject) => {
        scrypt(password, salt, KEY_BYTES, options, (error, key) =>
            error ? reject(error) : resolve(key),
        );
    });
}

export async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(SALT_BYTES);
    const key = await deriveKey(password, salt, COST);
    return [
        PREFIX,
        COST.N,
        COST.r,
        COST.p,
        salt.toString('base64url'),
        key.toString('base64url'),
    ].join('$');
}

/** Returns false (never throws) for a wrong password or a malformed hash. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
    const [prefix, N, r, p, salt, key] = stored.split('$');
    if (prefix !== PREFIX || !salt || !key) return false;

    const cost = { N: Number(N), r: Number(r), p: Number(p) };
    if (![cost.N, cost.r, cost.p].every(Number.isSafeInteger)) return false;

    const expected = Buffer.from(key, 'base64url');
    const actual = await deriveKey(password, Buffer.from(salt, 'base64url'), cost).catch(
        () => null,
    );
    return (
        actual !== null && actual.length === expected.length && timingSafeEqual(actual, expected)
    );
}
