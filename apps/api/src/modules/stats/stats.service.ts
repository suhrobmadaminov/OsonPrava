import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(userId: number) {
    const totalTests = await this.prisma.testSession.count({
      where: { userId, completedAt: { not: null } },
    });

    const passedTests = await this.prisma.testSession.count({
      where: { userId, isPassed: true },
    });

    const testAggregates = await this.prisma.testSession.aggregate({
      where: { userId, completedAt: { not: null } },
      _sum: {
        correctAnswers: true,
        wrongAnswers: true,
        skippedAnswers: true,
        totalQuestions: true,
      },
    });

    const totalAnswered =
      (testAggregates._sum.correctAnswers || 0) +
      (testAggregates._sum.wrongAnswers || 0) +
      (testAggregates._sum.skippedAnswers || 0);

    const correctPercent =
      totalAnswered > 0
        ? Math.round(((testAggregates._sum.correctAnswers || 0) / totalAnswered) * 100)
        : 0;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { streak: true, longestStreak: true },
    });

    return {
      totalTests,
      passedTests,
      totalQuestionsAnswered: totalAnswered,
      correctAnswers: testAggregates._sum.correctAnswers || 0,
      wrongAnswers: testAggregates._sum.wrongAnswers || 0,
      correctPercent,
      streak: user?.streak || 0,
      longestStreak: user?.longestStreak || 0,
    };
  }

  async getWeekly(userId: number) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const dailyStats: { date: string; tests: number; correct: number; total: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(now.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const daySessions = await this.prisma.testSession.aggregate({
        where: {
          userId,
          startedAt: { gte: dayStart, lte: dayEnd },
          completedAt: { not: null },
        },
        _count: true,
        _sum: { correctAnswers: true, totalQuestions: true },
      });

      dailyStats.push({
        date: dayStart.toISOString().split('T')[0],
        tests: daySessions._count,
        correct: daySessions._sum.correctAnswers || 0,
        total: daySessions._sum.totalQuestions || 0,
      });
    }

    const weekTotal = await this.prisma.testSession.aggregate({
      where: {
        userId,
        startedAt: { gte: weekAgo },
        completedAt: { not: null },
      },
      _count: true,
      _sum: { correctAnswers: true, totalQuestions: true, timeSpentSec: true },
    });

    return {
      daily: dailyStats,
      weekSummary: {
        totalTests: weekTotal._count,
        totalCorrect: weekTotal._sum.correctAnswers || 0,
        totalQuestions: weekTotal._sum.totalQuestions || 0,
        totalTimeSec: weekTotal._sum.timeSpentSec || 0,
      },
    };
  }

  async getTopicStats(userId: number) {
    const topics = await this.prisma.topic.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' },
    });

    const topicStats = await Promise.all(
      topics.map(async (topic) => {
        const stats = await this.prisma.userQuestionStat.aggregate({
          where: {
            userId,
            question: { topicId: topic.id },
          },
          _count: true,
          _sum: { timesAnswered: true, timesCorrect: true },
        });

        const totalQuestions = await this.prisma.question.count({
          where: { topicId: topic.id, isActive: true },
        });

        return {
          topicId: topic.id,
          nameUz: topic.nameUz,
          nameUzCyr: topic.nameUzCyr,
          nameRu: topic.nameRu,
          slug: topic.slug,
          totalQuestions,
          answeredQuestions: stats._count,
          timesAnswered: stats._sum.timesAnswered || 0,
          timesCorrect: stats._sum.timesCorrect || 0,
          correctPercent:
            stats._sum.timesAnswered && stats._sum.timesAnswered > 0
              ? Math.round(((stats._sum.timesCorrect || 0) / stats._sum.timesAnswered) * 100)
              : 0,
          progress:
            totalQuestions > 0 ? Math.round((stats._count / totalQuestions) * 100) : 0,
        };
      }),
    );

    return topicStats;
  }

  async getStreak(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        streak: true,
        longestStreak: true,
        lastActiveAt: true,
      },
    });

    // Get last 30 days of activity
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentSessions = await this.prisma.testSession.findMany({
      where: {
        userId,
        startedAt: { gte: thirtyDaysAgo },
        completedAt: { not: null },
      },
      select: { startedAt: true },
      orderBy: { startedAt: 'desc' },
    });

    const activeDays = new Set(
      recentSessions.map((s) => s.startedAt.toISOString().split('T')[0]),
    );

    return {
      currentStreak: user?.streak || 0,
      longestStreak: user?.longestStreak || 0,
      lastActiveAt: user?.lastActiveAt,
      activeDaysLast30: activeDays.size,
      activeDates: Array.from(activeDays),
    };
  }
}
