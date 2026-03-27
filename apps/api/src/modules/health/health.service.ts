import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { REDIS_CLIENT } from '../../config/redis.module';
import Redis from 'ioredis';

@Injectable()
export class HealthService {
  private readonly startTime = Date.now();

  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async check() {
    const checks: {
      status: string;
      uptime: number;
      database: { status: string; latencyMs?: number; error?: string };
      redis: { status: string; latencyMs?: number; error?: string };
    } = {
      status: 'ok',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      database: { status: 'unknown' },
      redis: { status: 'unknown' },
    };

    // Check database
    try {
      const dbStart = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = {
        status: 'up',
        latencyMs: Date.now() - dbStart,
      };
    } catch (error) {
      checks.database = {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      checks.status = 'degraded';
    }

    // Check Redis
    try {
      const redisStart = Date.now();
      await this.redis.ping();
      checks.redis = {
        status: 'up',
        latencyMs: Date.now() - redisStart,
      };
    } catch (error) {
      checks.redis = {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      checks.status = 'degraded';
    }

    if (checks.database.status === 'down' && checks.redis.status === 'down') {
      checks.status = 'critical';
    }

    return checks;
  }
}
