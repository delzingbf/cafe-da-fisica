import { UnauthorizedException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { Admin } from '../admins/admin.entity.js';
import { AuthService } from './auth.service.js';
import { hashPassword, verifyPassword } from './password.js';

describe('AuthService password changes', () => {
    it('requires the current password and stores the new password as a hash', async () => {
        const admin = Object.assign(new Admin(), {
            id: 7,
            email: 'admin@example.com',
            passwordHash: await hashPassword('senha-atual'),
        });
        const update = vi.fn().mockResolvedValue(undefined);
        const repository = { update } as unknown as Repository<Admin>;
        const service = new AuthService(repository, { signAsync: vi.fn() } as never);

        await expect(
            service.changePassword(admin, {
                currentPassword: 'senha-incorreta',
                newPassword: 'senha-nova-segura',
            }),
        ).rejects.toBeInstanceOf(UnauthorizedException);
        expect(update).not.toHaveBeenCalled();

        await service.changePassword(admin, {
            currentPassword: 'senha-atual',
            newPassword: 'senha-nova-segura',
        });

        const [, values] = update.mock.calls[0];
        expect(values.passwordHash).not.toBe('senha-nova-segura');
        await expect(verifyPassword('senha-nova-segura', values.passwordHash)).resolves.toBe(true);
        await expect(verifyPassword('senha-atual', values.passwordHash)).resolves.toBe(false);
    });
});
