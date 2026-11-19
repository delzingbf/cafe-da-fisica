import { hashPassword, verifyPassword } from './password.js';

describe('password hashing', () => {
    it('accepts the password a hash was made from', async () => {
        const hash = await hashPassword('café com leite');

        await expect(verifyPassword('café com leite', hash)).resolves.toBe(true);
    });

    it('rejects a different password', async () => {
        const hash = await hashPassword('café com leite');

        await expect(verifyPassword('café sem leite', hash)).resolves.toBe(false);
    });

    it('salts every hash, so the same password never hashes the same way twice', async () => {
        const [first, second] = await Promise.all([hashPassword('same'), hashPassword('same')]);

        expect(first).not.toBe(second);
        expect(first).toMatch(/^scrypt\$32768\$8\$1\$[\w-]+\$[\w-]+$/);
    });

    it.each(['', 'not-a-hash', 'bcrypt$10$abc$def$ghi$jkl', 'scrypt$x$8$1$c2FsdA$a2V5'])(
        'returns false for the malformed hash %p',
        async (stored) => {
            await expect(verifyPassword('anything', stored)).resolves.toBe(false);
        },
    );
});
