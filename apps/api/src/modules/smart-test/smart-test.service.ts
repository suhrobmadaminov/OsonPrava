import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SmartTestService {
  private readonly SMART_TEST_SIZE = 20;

  constructor(private readonly prisma: PrismaService) {}

  async startSmartTest(userId: number) {
    const now = new Date();

    // SM-2: pick questions due for review, sorted by lowest easeFactor first
    const dueStats = await this.prisma.userQuestionStat.findMany({
      where: {
        userId,
        nextReviewAt: { lte: now },
      },
      orderBy: { easeFactor: 'asc' },
      take: this.SMART_TEST_SIZE,
      include: {
        question: {
          include: { answers: { orderBy: { orderIndex: 'asc' } }, topic: true },
        },
      },
    });

    const selectedQuestionIds = dueStats.map((s) => s.questionId);
    let questions = dueStats.map((s) => s.question);

    // If not enough due questions, fill with unanswered ones
    if (questions.length < this.SMART_TEST_SIZE) {
      const remaining = this.SMART_TEST_SIZE - questions.length;

      const unanswered = await this.prisma.question.findMany({
        where: {
          isActive: true,
          id: { notIn: selectedQuestionIds },
          userStats: {
            none: { userId },
          },
        },
        take: remaining,
        include: {
          answers: { orderBy: { orderIndex: 'asc' } },
          topic: true,
        },
        orderBy: { id: 'asc' },
      });

      questions = [...questions, ...unanswered];
    }

    // Create test session with type SMART
    const session = await this.prisma.testSession.create({
      data: {
        userId,
        type: 'SMART',
        totalQuestions: questions.length,
      },
    });

    return {
      session,
      questions,
    };
  }

  async getStats(userId: number) {
    const totalStats = await this.prisma.userQuestionStat.aggregate({
      where: { userId },
      _count: true,
      _avg: { easeFactor: true },
    });

    const now = new Date();
    const dueCount = await this.prisma.userQuestionStat.count({
      where: {
        userId,
        nextReviewAt: { lte: now },
      },
    });

    const masteredCount = await this.prisma.userQuestionStat.count({
      where: {
        userId,
        consecutiveCorrect: { gte: 5 },
        easeFactor: { gte: 2.5 },
      },
    });

    const smartSessions = await this.prisma.testSession.findMany({
      where: { userId, type: 'SMART' },
      orderBy: { startedAt: 'desc' },
      take: 10,
    });

    const totalQuestions = await this.prisma.question.count({
      where: { isActive: true },
    });

    return {
      totalTracked: totalStats._count,
      totalQuestions,
      avgEaseFactor: totalStats._avg.easeFactor || 2.5,
      dueForReview: dueCount,
      mastered: masteredCount,
      recentSessions: smartSessions,
    };
  }
}
