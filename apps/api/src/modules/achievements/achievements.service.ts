import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AchievementsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId?: number) {
    const achievements = await this.prisma.achievement.findMany({
      orderBy: { points: 'desc' },
    });

    if (!userId) {
      return achievements;
    }

    // Get user's unlocked achievements
    const userAchievements = await this.prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true, unlockedAt: true },
    });

    const unlockedMap = new Map(
      userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt]),
    );

    return achievements.map((a) => ({
      ...a,
      isUnlocked: unlockedMap.has(a.id),
      unlockedAt: unlockedMap.get(a.id) || null,
    }));
  }

  async getMyAchievements(userId: number) {
    const userAchievements = await this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
    });

    const totalPoints = userAchievements.reduce(
      (sum, ua) => sum + ua.achievement.points,
      0,
    );

    const totalAchievements = await this.prisma.achievement.count();

    return {
      unlocked: userAchievements,
      totalPoints,
      unlockedCount: userAchievements.length,
      totalAchievements,
      progress: totalAchievements > 0
        ? Math.round((userAchievements.length / totalAchievements) * 100)
        : 0,
    };
  }
}
