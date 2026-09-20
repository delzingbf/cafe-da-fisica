import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
    const dataSource = { query: vi.fn<(sql: string) => Promise<unknown>>() };
    let controller: HealthController;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [HealthController],
            providers: [{ provide: DataSource, useValue: dataSource }],
        }).compile();

        controller = moduleRef.get(HealthController);
    });

    it('reports ok when the database answers', async () => {
        dataSource.query.mockResolvedValue([{ '?column?': 1 }]);

        await expect(controller.check()).resolves.toMatchObject({ status: 'ok', database: 'up' });
    });

    it('reports degraded when the database is unreachable', async () => {
        dataSource.query.mockRejectedValue(new Error('connection refused'));

        await expect(controller.check()).resolves.toMatchObject({
            status: 'degraded',
            database: 'down',
        });
    });
});
