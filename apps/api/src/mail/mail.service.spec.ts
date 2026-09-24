import type { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import type { Env } from '../config/env.js';
import { MailService } from './mail.service.js';

const send = vi.hoisted(() => vi.fn());

vi.mock('resend', () => ({
    Resend: vi.fn(function () {
        return { emails: { send } };
    }),
}));

function createService(env: Partial<Env>) {
    const config = { get: (key: keyof Env) => env[key] } as ConfigService<Env, true>;
    return new MailService(config);
}

const message = { to: 'pedidos@example.com', subject: 'Novo pedido', html: '<p>Oi</p>' };

describe('MailService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('only logs when RESEND_API_KEY is not set', async () => {
        const service = createService({ EMAIL_FROM: 'Café <a@example.com>' });

        await expect(service.send(message)).resolves.toBeUndefined();
        expect(Resend).not.toHaveBeenCalled();
    });

    it('sends through Resend from EMAIL_FROM', async () => {
        send.mockResolvedValue({ data: { id: 'email_1' }, error: null });
        const service = createService({
            RESEND_API_KEY: 're_test',
            EMAIL_FROM: 'Café <a@example.com>',
        });

        await service.send(message);

        expect(Resend).toHaveBeenCalledWith('re_test');
        expect(send).toHaveBeenCalledWith({ from: 'Café <a@example.com>', ...message });
    });

    it('throws when Resend returns an error', async () => {
        send.mockResolvedValue({
            data: null,
            error: {
                name: 'invalid_from_address',
                message: 'Invalid `from` field',
                statusCode: 422,
            },
        });
        const service = createService({ RESEND_API_KEY: 're_test', EMAIL_FROM: 'bad' });

        await expect(service.send(message)).rejects.toThrow(/invalid_from_address/);
    });
});
