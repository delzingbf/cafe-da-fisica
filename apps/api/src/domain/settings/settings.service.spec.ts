import type { Repository } from 'typeorm';
import type { Admin } from '../admins/admin.entity.js';
import { Settings } from './settings.entity.js';
import { SettingsService } from './settings.service.js';

describe('SettingsService', () => {
    it('returns null when no notification email has been configured', async () => {
        const repository = {
            findOneBy: vi.fn().mockResolvedValue(null),
        } as unknown as Repository<Settings>;
        const service = new SettingsService(repository, {} as never);

        await expect(service.getSettings()).resolves.toEqual({ orderNotificationEmail: null });
    });

    it('creates or updates the notification email and records the admin', async () => {
        const save = vi.fn().mockImplementation(async (settings) => settings);
        const repository = {
            findOneBy: vi.fn().mockResolvedValue(null),
            create: vi.fn((settings) => settings),
            save,
        } as unknown as Repository<Settings>;
        const mailService = { send: vi.fn().mockResolvedValue(true) };
        const service = new SettingsService(repository, mailService as never);
        const admin = { id: 9 } as Admin;

        await expect(
            service.updateOrderNotificationEmail('pedidos@example.com', admin),
        ).resolves.toEqual({ confirmationEmailSent: true });

        expect(save).toHaveBeenCalledWith({
            id: true,
            orderNotificationEmail: 'pedidos@example.com',
            updatedById: 9,
        });
        expect(mailService.send).toHaveBeenCalledWith(
            expect.objectContaining({
                to: 'pedidos@example.com',
                subject: 'E-mail de recebimento de pedidos atualizado',
                text: expect.stringContaining(
                    'configurado para receber os avisos de novos pedidos',
                ),
            }),
        );
    });

    it('keeps the new email when sending its confirmation fails', async () => {
        const save = vi.fn().mockResolvedValue(undefined);
        const repository = {
            findOneBy: vi.fn().mockResolvedValue(null),
            create: vi.fn((settings) => settings),
            save,
        } as unknown as Repository<Settings>;
        const mailService = { send: vi.fn().mockRejectedValue(new Error('mail unavailable')) };
        const service = new SettingsService(repository, mailService as never);

        await expect(
            service.updateOrderNotificationEmail('pedidos@example.com', { id: 9 } as Admin),
        ).resolves.toEqual({ confirmationEmailSent: false });
        expect(save).toHaveBeenCalledOnce();
    });

    it('escapes the configured address in the confirmation HTML', async () => {
        const repository = {
            findOneBy: vi.fn().mockResolvedValue(null),
            create: vi.fn((settings) => settings),
            save: vi.fn().mockResolvedValue(undefined),
        } as unknown as Repository<Settings>;
        const mailService = { send: vi.fn().mockResolvedValue(true) };
        const service = new SettingsService(repository, mailService as never);

        await service.updateOrderNotificationEmail('a&b@example.com', { id: 9 } as Admin);

        expect(mailService.send.mock.calls[0][0].html).toContain('a&amp;b@example.com');
    });
});
