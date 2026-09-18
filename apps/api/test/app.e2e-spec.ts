import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { API_PREFIX } from '@cafe-da-fisica/shared';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      // No real database in this suite; swap it for a stub that always answers.
      .overrideProvider(PrismaService)
      .useValue({ ping: async () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix(API_PREFIX);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it(`GET /${API_PREFIX}/health`, async () => {
    const res = await request(app.getHttpServer()).get(`/${API_PREFIX}/health`).expect(200);

    expect(res.body).toMatchObject({ status: 'ok', database: 'up' });
  });
});
