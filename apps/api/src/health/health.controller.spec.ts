import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  const prisma = { ping: vi.fn<() => Promise<boolean>>() };
  let controller: HealthController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: PrismaService, useValue: prisma }],
    }).compile();

    controller = moduleRef.get(HealthController);
  });

  it('reports ok when the database answers', async () => {
    prisma.ping.mockResolvedValue(true);

    await expect(controller.check()).resolves.toMatchObject({ status: 'ok', database: 'up' });
  });

  it('reports degraded when the database is unreachable', async () => {
    prisma.ping.mockResolvedValue(false);

    await expect(controller.check()).resolves.toMatchObject({
      status: 'degraded',
      database: 'down',
    });
  });
});
