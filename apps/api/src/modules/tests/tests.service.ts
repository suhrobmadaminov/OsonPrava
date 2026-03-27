import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StartTestDto } from './dto/start-test.dto';
import { AnswerDto } from './dto/answer.dto';
import { TestType } from '@prisma/client';

@Injectable()
export class TestsService {
  constructor(private prisma: PrismaService) {}

  async startTest(userId: number, dto: StartTestDto) {
    let questions: { id: number }[];

    switch (dto.type) {
      case TestType.TICKET:
        if (!dto.ticketId) throw new BadRequestException('ticketId required for TICKET test');
        const ticketQuestions = await this.prisma.ticketQuestion.findMany({
          where: { ticketId: dto.ticketId },
          orderBy: { orderIndex: 'asc' },
          select: { questionId: true },
        });
        questions = ticketQuestions.map((tq) => ({ id: tq.questionId }));
        break;

      case TestType.TOPIC:
        if (!dto.topicId) throw new BadRequestException('topicId required for TOPIC test');
        questions = await this.prisma.question.findMany({
          where: { topicId: dto.topicId, isActive: true },
          select: { id: true },
        });
        break;

      case TestType.EXAM:
        questions = await this.getRandomQuestions(20);
        break;

      case TestType.MARATHON:
        questions = await this.prisma.question.findMany({
          where: { isActive: true },
          select: { id: true },
          orderBy: { id: 'asc' },
        });
        break;

      case TestType.MISTAKES:
        const wrongQuestionIds = await this.prisma.userQuestionStat.findMany({
          where: { userId, timesAnswered: { gt: 0 }, consecutiveCorrect: 0 },
          select: { questionId: true },
        });
        questions = wrongQuestionIds.map((q) => ({ id: q.questionId }));
        if (!questions.length) throw new BadRequestException('No mistakes to review');
        break;

      default:
        questions = await this.getRandomQuestions(20);
    }

    const session = await this.prisma.testSession.create({
      data: {
        userId,
        type: dto.type,
        ticketId: dto.ticketId,
        topicId: dto.topicId,
        totalQuestions: questions.length,
      },
    });

    // Return session with first questions
    const fullQuestions = await this.prisma.question.findMany({
      where: { id: { in: questions.map((q) => q.id) } },
      include: { answers: { orderBy: { orderIndex: 'asc' } } },
    });

    return { session, questions: fullQuestions };
  }

  async answerQuestion(userId: number, sessionId: number, dto: AnswerDto) {
    const session = await this.prisma.testSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) throw new NotFoundException('Test session not found');
    if (session.completedAt) throw new BadRequestException('Test already completed');

    // Check if answer is correct
    const correctAnswer = await this.prisma.answer.findFirst({
      where: { questionId: dto.questionId, isCorrect: true },
    });

    const isCorrect = correctAnswer?.id === dto.selectedAnswerId;

    // Save answer
    const testAnswer = await this.prisma.testAnswer.create({
      data: {
        testSessionId: sessionId,
        questionId: dto.questionId,
        selectedAnswerId: dto.selectedAnswerId,
        isCorrect,
        timeSpentSec: dto.timeSpentSec,
      },
    });

    // Update session counters
    await this.prisma.testSession.update({
      where: { id: sessionId },
      data: {
        correctAnswers: { increment: isCorrect ? 1 : 0 },
        wrongAnswers: { increment: isCorrect ? 0 : 1 },
      },
    });

    // Update user question stats (for smart test)
    await this.updateQuestionStats(userId, dto.questionId, isCorrect);

    // Get explanation
    const question = await this.prisma.question.findUnique({
      where: { id: dto.questionId },
      select: {
        explanationUz: true,
        explanationUzCyr: true,
        explanationRu: true,
        audioUrlUz: true,
        audioUrlRu: true,
      },
    });

    return {
      isCorrect,
      correctAnswerId: correctAnswer?.id,
      explanation: question,
    };
  }

  async completeTest(userId: number, sessionId: number) {
    const session = await this.prisma.testSession.findFirst({
      where: { id: sessionId, userId },
      include: { answers: true },
    });
    if (!session) throw new NotFoundException('Test session not found');

    const score = session.totalQuestions > 0
      ? Math.round((session.correctAnswers / session.totalQuestions) * 100)
      : 0;
    const isPassed = score >= 90; // 18 out of 20 = 90%
    const timeSpentSec = Math.floor((Date.now() - session.startedAt.getTime()) / 1000);

    const updated = await this.prisma.testSession.update({
      where: { id: sessionId },
      data: {
        score,
        isPassed,
        completedAt: new Date(),
        timeSpentSec,
        skippedAnswers: session.totalQuestions - session.correctAnswers - session.wrongAnswers,
      },
    });

    // Update user streak
    await this.updateStreak(userId);

    return updated;
  }

  async getTestResult(userId: number, sessionId: number) {
    const session = await this.prisma.testSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        answers: {
          include: {
            // We don't have a direct relation, so we'll return questionId
          },
        },
      },
    });
    if (!session) throw new NotFoundException('Test session not found');
    return session;
  }

  async getHistory(userId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.testSession.findMany({
        where: { userId, completedAt: { not: null } },
        orderBy: { completedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.testSession.count({
        where: { userId, completedAt: { not: null } },
      }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  private async getRandomQuestions(count: number) {
    const safeCount = Math.min(Math.max(1, Math.floor(count)), 1000);
    const questions = await this.prisma.$queryRaw<{ id: number }[]>`
      SELECT id FROM questions WHERE is_active = true ORDER BY RANDOM() LIMIT ${safeCount}
    `;
    return questions;
  }

  private async updateQuestionStats(userId: number, questionId: number, isCorrect: boolean) {
    const existing = await this.prisma.userQuestionStat.findUnique({
      where: { userId_questionId: { userId, questionId } },
    });

    if (existing) {
      const consecutiveCorrect = isCorrect ? existing.consecutiveCorrect + 1 : 0;
      // SM-2 algorithm
      let easeFactor = existing.easeFactor;
      let interval = existing.interval;

      if (isCorrect) {
        if (consecutiveCorrect === 1) interval = 1;
        else if (consecutiveCorrect === 2) interval = 6;
        else interval = Math.round(existing.interval * easeFactor);
        easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - 4) * (0.08 + (5 - 4) * 0.02)));
      } else {
        interval = 1;
        easeFactor = Math.max(1.3, easeFactor - 0.2);
      }

      const nextReviewAt = new Date();
      nextReviewAt.setDate(nextReviewAt.getDate() + interval);

      await this.prisma.userQuestionStat.update({
        where: { id: existing.id },
        data: {
          timesAnswered: { increment: 1 },
          timesCorrect: { increment: isCorrect ? 1 : 0 },
          consecutiveCorrect,
          easeFactor,
          interval,
          nextReviewAt,
          lastAnsweredAt: new Date(),
        },
      });
    } else {
      const nextReviewAt = new Date();
      nextReviewAt.setDate(nextReviewAt.getDate() + (isCorrect ? 1 : 0));

      await this.prisma.userQuestionStat.create({
        data: {
          userId,
          questionId,
          timesAnswered: 1,
          timesCorrect: isCorrect ? 1 : 0,
          consecutiveCorrect: isCorrect ? 1 : 0,
          easeFactor: 2.5,
          interval: isCorrect ? 1 : 0,
          nextReviewAt,
          lastAnsweredAt: new Date(),
        },
      });
    }
  }

  private async updateStreak(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { streak: true, longestStreak: true, lastActiveAt: true },
    });
    if (!user) return;

    const now = new Date();
    const lastActive = user.lastActiveAt;
    let newStreak = user.streak;

    if (lastActive) {
      const diffDays = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return; // Already active today
      if (diffDays === 1) newStreak += 1;
      else newStreak = 1; // Streak broken
    } else {
      newStreak = 1;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        streak: newStreak,
        longestStreak: Math.max(newStreak, user.longestStreak),
        lastActiveAt: now,
      },
    });
  }
}
