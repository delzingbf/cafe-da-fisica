import { Controller, Get } from '@nestjs/common';
import type { HealthResponse } from '@cafe-da-fisica/shared';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
    constructor(private readonly dataSource: DataSource) {}

    // Always answers 200 so the web client can display a degraded state instead of an error.
    @Get()
    async check(): Promise<HealthResponse> {
        const database = (await this.ping()) ? 'up' : 'down';
        return {
            status: database === 'up' ? 'ok' : 'degraded',
            database,
            uptime: Math.round(process.uptime()),
            timestamp: new Date().toISOString(),
        };
    }

    /** Cheap round-trip to confirm the database still answers. */
    private async ping(): Promise<boolean> {
        try {
            await this.dataSource.query('SELECT 1');
            return true;
        } catch {
            return false;
        }
    }
}
