import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { API_PREFIX } from '@cafe-da-fisica/shared';
import { AppModule } from '../src/app.module.js';

describe('App (e2e)', () => {
    let app: INestApplication<App>;

    beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix(API_PREFIX);
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it(`GET /${API_PREFIX}/health`, async () => {
        const res = await request(app.getHttpServer()).get(`/${API_PREFIX}/health`).expect(200);

        expect(res.body).toMatchObject({ status: 'ok', database: 'up' });
    });
});
