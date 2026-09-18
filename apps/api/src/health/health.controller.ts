import { Controller, Get } from '@nestjs/common';
import type { HealthResponse } from '@cafe-da-fisica/shared';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  // Always answers 200 so the web client can display a degraded state instead of an error.
  @Get()
  async check(): Promise<HealthResponse> {
    const database = (await this.prisma.ping()) ? 'up' : 'down';
    return {
      status: database === 'up' ? 'ok' : 'degraded',
      database,
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}
