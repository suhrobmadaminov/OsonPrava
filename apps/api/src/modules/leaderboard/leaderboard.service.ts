import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { REDIS_CLIENT } from '../../config/redis.module';
import Redis from 'ioredis';

@Injectable()
export class LeaderboardService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  private async enrichWithUsers(
    entries: { userId: number; score: number }[],
  ) {
    if (entries.length === 0) return [];

    const userIds = entries.map((e) => e.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        username: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    return entries.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      score: entry.score,
      user: userMap.get(entry.userId) || null,
    }));
  }

  private async getFromRedis(key: string, limit = 50) {
    const entries = await this.redis.zrevrange(key, 0, limit - 1, 'WITHSCORES');

    const parsed: { userId: number; score: number }[] = [];
    for (let i = 0; i < entries.length; i += 2) {
      parsed.push({
        userId: Number(entries[i]),
        score: Number(entries[i + 1]),
      });
    }

    return this.enrichWithUsers(parsed);
  }

  async getGeneral() {
    // Try Redis first
    const cached = await this.getFromRedis('leaderboard:general');
    if (cached.length > 0) return cached;

    // Fallback: compute from DB
    const sessions = await this.prisma.testSession.groupBy({
      by: ['userId'],
      where: { completedAt: { not: null } },
      _sum: { correctAnswers: true },
      orderBy: { _sum: { correctAnswers: 'desc' } },
      take: 50,
    });

    const entries = sessions.map((s) => ({
      userId: s.userId,
      score: s._sum.correctAnswers || 0,
    }));

    // Cache in Redis
    const pipeline = this.redis.pipeline();
    for (const entry of entries) {
      pipeline.zadd('leaderboard:general', entry.score, String(entry.userId));
    }
    pipeline.expire('leaderboard:general', 3600);
    await pipeline.exec();

    return this.enrichWithUsers(entries);
  }

  async getWeekly() {
    const weekKey = this.getWeeklyKey();

    // Try Redis first
    const cached = await this.getFromRedis(weekKey);
    if (cached.length > 0) return cached;

    // Fallback: compute from DB for this week
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const sessions = await this.prisma.testSession.groupBy({
      by: ['userId'],
      where: {
        completedAt: { not: null },
        startedAt: { gte: weekStart },
      },
      _sum: { correctAnswers: true },
      orderBy: { _sum: { correctAnswers: 'desc' } },
      take: 50,
    });

    const entries = sessions.map((s) => ({
      userId: s.userId,
      score: s._sum.correctAnswers || 0,
    }));

    // Cache in Redis with weekly expiry
    const pipeline = this.redis.pipeline();
    for (const entry of entries) {
      pipeline.zadd(weekKey, entry.score, String(entry.userId));
    }
    // Expire at end of week
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    const ttl = Math.floor((weekEnd.getTime() - now.getTime()) / 1000);
    pipeline.expire(weekKey, Math.max(ttl, 60));
    await pipeline.exec();

    return this.enrichWithUsers(entries);
  }

  async getOctagon() {
    return this.getFromRedis('leaderboard:octagon');
  }

  private getWeeklyKey(): string {
    const now = new Date();
    const year = now.getFullYear();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const month = String(weekStart.getMonth() + 1).padStart(2, '0');
    const day = String(weekStart.getDate()).padStart(2, '0');
    return `leaderboard:weekly:${year}-${month}-${day}`;
  }
}
