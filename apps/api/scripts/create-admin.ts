// Creates an admin account, or sets a new password if the email already has one. There is no
// sign-up route: this is the only way to add admins.
// Usage (from apps/api): `npm run admin:create -- admin@example.com "a-long-password"`
// Use double quotes: Windows' cmd.exe keeps single quotes as part of the password.
// The password ends up in your shell history; clear it afterwards if that matters.
import { Admin } from '../src/domain/admins/admin.entity.js';
import { hashPassword } from '../src/domain/auth/password.js';
import dataSource from '../src/infrastructure/database/data-source.js';

const MIN_PASSWORD_LENGTH = 8;

const [rawEmail, password] = process.argv.slice(2);
if (!rawEmail || !password) {
    throw new Error('Usage: npm run admin:create -- admin@example.com "a-long-password"');
}
// Almost certainly quotes the shell did not strip (cmd.exe and single quotes), not a real password.
if (/^(['"]).*\1$/.test(password)) {
    throw new Error(
        `The password ${password} still has its quotes, so they would become part of it. ` +
            'Use double quotes ("...") or none.',
    );
}
if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`The password must have at least ${MIN_PASSWORD_LENGTH} characters.`);
}

// Same normalisation as the login DTO (CHK_admins_email_lowercase).
const email = rawEmail.trim().toLowerCase();

await dataSource.initialize();
try {
    const existing = await dataSource.manager.findOneBy(Admin, { email });
    const passwordHash = await hashPassword(password);

    if (existing) {
        await dataSource.manager.update(Admin, existing.id, { passwordHash });
        console.log(`Updated the password of admin #${existing.id} (${email}).`);
    } else {
        const { identifiers } = await dataSource.manager.insert(Admin, { email, passwordHash });
        console.log(`Created admin #${identifiers[0].id} (${email}).`);
    }
} finally {
    await dataSource.destroy();
}
