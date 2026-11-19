import type { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
import type { Env } from '../config/env.js';
import { MailService } from './mail.service.js';

const sendMail = vi.hoisted(() => vi.fn());

vi.mock('nodemailer', () => ({
    createTransport: vi.fn(() => ({ sendMail })),
}));

const gmail: Partial<Env> = {
    SMTP_HOST: 'smtp.gmail.com',
    SMTP_PORT: 465,
    SMTP_USER: 'cafe@gmail.com',
    SMTP_PASSWORD: 'abcdefghijklmnop',
};

function createService(env: Partial<Env>) {
    const config = { get: (key: keyof Env) => env[key] } as ConfigService<Env, true>;
    return new MailService(config);
}

const message = { to: 'pedidos@example.com', subject: 'Novo pedido', html: '<p>Oi</p>' };

describe('MailService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('only logs when the SMTP credentials are not set', async () => {
        const service = createService({ SMTP_HOST: 'smtp.gmail.com', SMTP_PORT: 465 });

        await expect(service.send(message)).resolves.toBe(false);
        expect(createTransport).not.toHaveBeenCalled();
    });

    it('sends through the SMTP server, as the logged-in account by default', async () => {
        sendMail.mockResolvedValue({ messageId: '<1@gmail.com>' });
        const service = createService(gmail);

        await expect(service.send(message)).resolves.toBe(true);

        expect(createTransport).toHaveBeenCalledWith(
            expect.objectContaining({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: { user: 'cafe@gmail.com', pass: 'abcdefghijklmnop' },
            }),
        );
        expect(sendMail).toHaveBeenCalledWith({
            from: 'Café da Física <cafe@gmail.com>',
            ...message,
        });
    });

    it('uses EMAIL_FROM when set, and STARTTLS on port 587', async () => {
        sendMail.mockResolvedValue({ messageId: '<2@gmail.com>' });
        const service = createService({
            ...gmail,
            SMTP_PORT: 587,
            EMAIL_FROM: 'Pedidos <cafe@gmail.com>',
        });

        await service.send(message);

        expect(createTransport).toHaveBeenCalledWith(
            expect.objectContaining({ port: 587, secure: false }),
        );
        expect(sendMail).toHaveBeenCalledWith(
            expect.objectContaining({ from: 'Pedidos <cafe@gmail.com>' }),
        );
    });

    it('throws with the subject when the server refuses the message', async () => {
        sendMail.mockRejectedValue(
            new Error('Invalid login: 535-5.7.8 Username and Password not accepted'),
        );
        const service = createService(gmail);

        await expect(service.send(message)).rejects.toThrow(
            'Could not send "Novo pedido": Invalid login',
        );
    });
});
