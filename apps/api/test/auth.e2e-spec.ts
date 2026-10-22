import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { API_PREFIX } from '@cafe-da-fisica/shared';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { Admin } from '../src/domain/admins/admin.entity.js';
import { hashPassword } from '../src/domain/auth/password.js';
import { SESSION_COOKIE } from '../src/domain/auth/session.js';
import { testDataSource } from './setup-database.js';

// The login route allows 5 attempts per minute and the limit is shared by every test in this
// file, so tests before the rate-limit one must log in at most 5 times in total.
describe('Auth (e2e)', () => {
    const email = 'admin@example.com';
    const password = 'correct horse battery staple';
    let app: INestApplication<App>;
    let admin: Admin;

    beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        configureApp(app);
        await app.init();
    });

    beforeEach(async () => {
        admin = await testDataSource.getRepository(Admin).save({
            email,
            passwordHash: await hashPassword(password),
        });
    });

    afterAll(async () => {
        await app.close();
    });

    const login = (body: object) =>
        request(app.getHttpServer()).post(`/${API_PREFIX}/auth/login`).send(body);

    /** The `name=value` part of the session cookie set by a response. */
    function sessionCookie(res: request.Response): string {
        const header = ([] as string[]).concat(res.headers['set-cookie'] ?? []);
        const cookie = header.find((c) => c.startsWith(`${SESSION_COOKIE}=`));
        if (!cookie) throw new Error('No session cookie in the response');
        return cookie;
    }

    it('logs in, sets an httpOnly session cookie and records the login time', async () => {
        // Email is matched case-insensitively.
        const res = await login({ email: ' Admin@Example.com ', password }).expect(200);

        expect(res.body).toEqual({ id: admin.id, email });
        const cookie = sessionCookie(res);
        expect(cookie).toMatch(/HttpOnly/);
        expect(cookie).toMatch(/SameSite=Strict/);
        expect(cookie).toMatch(new RegExp(`Path=/${API_PREFIX}`));

        const saved = await testDataSource.getRepository(Admin).findOneByOrFail({ id: admin.id });
        expect(saved.lastLoginAt).toBeInstanceOf(Date);
    });

    it.each([
        ['a wrong password', { email, password: 'wrong' }],
        ['an unknown email', { email: 'nobody@example.com', password }],
    ])('rejects %s with the same 401 and no cookie', async (_case, body) => {
        const res = await login(body).expect(401);

        expect(res.body.message).toBe('Invalid email or password');
        expect(res.headers['set-cookie']).toBeUndefined();
    });

    it('GET /auth/me returns the admin of a valid session', async () => {
        const cookie = sessionCookie(await login({ email, password }).expect(200));

        const res = await request(app.getHttpServer())
            .get(`/${API_PREFIX}/auth/me`)
            .set('Cookie', cookie.split(';')[0])
            .expect(200);

        expect(res.body).toEqual({ id: admin.id, email });
    });

    it.each([
        ['no cookie', undefined],
        ['a forged token', `${SESSION_COOKIE}=not.a.jwt`],
    ])('GET /auth/me responds 401 with %s', async (_case, cookie) => {
        const req = request(app.getHttpServer()).get(`/${API_PREFIX}/auth/me`);
        if (cookie) req.set('Cookie', cookie);

        await req.expect(401);
    });

    it('ends the sessions of a deleted admin', async () => {
        const cookie = sessionCookie(await login({ email, password }).expect(200));
        await testDataSource.getRepository(Admin).delete(admin.id);

        await request(app.getHttpServer())
            .get(`/${API_PREFIX}/auth/me`)
            .set('Cookie', cookie.split(';')[0])
            .expect(401);
    });

    it('POST /auth/logout expires the session cookie', async () => {
        const res = await request(app.getHttpServer())
            .post(`/${API_PREFIX}/auth/logout`)
            .expect(204);

        expect(sessionCookie(res)).toMatch(/Expires=Thu, 01 Jan 1970/);
    });

    // Must stay last: it uses up the login attempts of the whole file.
    it('rate-limits login attempts', async () => {
        let status = 0;
        for (let attempt = 0; attempt < 6; attempt++) {
            status = (await login({ email, password: 'wrong' })).status;
        }

        expect(status).toBe(429);
    });
});
