import type { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { API_PREFIX } from '@cafe-da-fisica/shared';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { Admin } from '../src/domain/admins/admin.entity.js';
import { hashPassword, verifyPassword } from '../src/domain/auth/password.js';
import type { SessionPayload } from '../src/domain/auth/session.js';
import { SESSION_COOKIE } from '../src/domain/auth/session.js';
import { Settings } from '../src/domain/settings/settings.entity.js';
import { testDataSource } from './setup-database.js';

// The admin "Configurações" page: the order notification email and the password change.
// POST /auth/password is rate-limited (5 per minute, per file), so it is called at most 5 times.
describe('Settings (e2e)', () => {
    const password = 'correct horse battery staple';
    let app: INestApplication<App>;
    let admin: Admin;
    let adminCookie: string;

    beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        configureApp(app);
        await app.init();
    });

    // Signs the session directly instead of logging in, which is rate-limited.
    beforeEach(async () => {
        admin = await testDataSource.getRepository(Admin).save({
            email: 'admin@example.com',
            passwordHash: await hashPassword(password),
        });
        const payload: SessionPayload = { sub: String(admin.id) };
        adminCookie = `${SESSION_COOKIE}=${await app.get(JwtService).signAsync(payload)}`;
    });

    afterAll(async () => {
        await app.close();
    });

    const api = () => request(app.getHttpServer());

    describe('order notification email', () => {
        it('is null until an admin sets it', async () => {
            const response = await api()
                .get(`/${API_PREFIX}/settings`)
                .set('Cookie', adminCookie)
                .expect(200);

            expect(response.body).toEqual({ orderNotificationEmail: null });
        });

        it('saves the email in lowercase and records who changed it', async () => {
            const response = await api()
                .put(`/${API_PREFIX}/settings/order-notification-email`)
                .set('Cookie', adminCookie)
                .send({ email: '  Pedidos@Example.com ' })
                .expect(200);

            // No RESEND_API_KEY in the tests, so no confirmation is actually sent.
            expect(response.body).toEqual({ confirmationEmailSent: false });
            const settings = await testDataSource
                .getRepository(Settings)
                .findOneByOrFail({ id: true });
            expect(settings).toMatchObject({
                orderNotificationEmail: 'pedidos@example.com',
                updatedById: admin.id,
            });

            const loaded = await api()
                .get(`/${API_PREFIX}/settings`)
                .set('Cookie', adminCookie)
                .expect(200);
            expect(loaded.body).toEqual({ orderNotificationEmail: 'pedidos@example.com' });
        });

        it('replaces an email set before', async () => {
            await testDataSource
                .getRepository(Settings)
                .save({ id: true, orderNotificationEmail: 'antigo@example.com' });

            await api()
                .put(`/${API_PREFIX}/settings/order-notification-email`)
                .set('Cookie', adminCookie)
                .send({ email: 'novo@example.com' })
                .expect(200);

            const rows = await testDataSource.getRepository(Settings).find();
            expect(rows).toEqual([
                expect.objectContaining({ orderNotificationEmail: 'novo@example.com' }),
            ]);
        });

        it('rejects an invalid email', async () => {
            await api()
                .put(`/${API_PREFIX}/settings/order-notification-email`)
                .set('Cookie', adminCookie)
                .send({ email: 'not-an-email' })
                .expect(400);

            expect(await testDataSource.getRepository(Settings).count()).toBe(0);
        });
    });

    describe('POST /auth/password', () => {
        const changePassword = (body: object) =>
            api().post(`/${API_PREFIX}/auth/password`).set('Cookie', adminCookie).send(body);

        const storedHash = async () =>
            (await testDataSource.getRepository(Admin).findOneByOrFail({ id: admin.id }))
                .passwordHash;

        it('changes the password when the current one is right', async () => {
            await changePassword({
                currentPassword: password,
                newPassword: 'nova senha segura',
            }).expect(204);

            const hash = await storedHash();
            expect(await verifyPassword('nova senha segura', hash)).toBe(true);
            expect(await verifyPassword(password, hash)).toBe(false);
        });

        it('refuses a wrong current password', async () => {
            await changePassword({
                currentPassword: 'errada',
                newPassword: 'nova senha segura',
            }).expect(401);

            expect(await verifyPassword(password, await storedHash())).toBe(true);
        });

        it('refuses a new password shorter than 8 characters', async () => {
            await changePassword({ currentPassword: password, newPassword: 'curta' }).expect(400);

            expect(await verifyPassword(password, await storedHash())).toBe(true);
        });
    });

    it.each([
        ['read the settings', 'get', '/settings'],
        ['change the notification email', 'put', '/settings/order-notification-email'],
        ['change the password', 'post', '/auth/password'],
    ] as const)('only an admin can %s', async (_case, method, path) => {
        await api()[method](`/${API_PREFIX}${path}`).expect(401);
    });
});
