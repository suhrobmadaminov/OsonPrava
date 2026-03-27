import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { REDIS_CLIENT } from '../../config/redis.module';
import Redis from 'ioredis';

@Injectable()
export class OctagonService {
  private readonly QUEUE_KEY = 'octagon:queue';
  private readonly MATCH_QUESTIONS = 10;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async findMatch(userId: number) {
    // Check if user is already in queue
    const existingEntry = await this.redis.lrange(this.QUEUE_KEY, 0, -1);
    if (existingEntry.includes(String(userId))) {
      return { status: 'waiting', message: 'Already in queue' };
    }

    // Check for a waiting player
    const waitingUserId = await this.redis.lpop(this.QUEUE_KEY);

    if (waitingUserId && Number(waitingUserId) !== userId) {
      // Found opponent — create a match
      const opponentId = Number(waitingUserId);

      // Get 10 random questions
      const questions = await this.prisma.question.findMany({
        where: { isActive: true },
        take: this.MATCH_QUESTIONS,
        orderBy: { id: 'asc' },
      });

      // Shuffle for randomness
      const shuffled = questions.sort(() => Math.random() - 0.5);
      const questionIds = shuffled.map((q) => q.id);

      const match = await this.prisma.octagonMatch.create({
        data: {
          status: 'IN_PROGRESS',
          questionsCount: this.MATCH_QUESTIONS,
          questionIds,
          startedAt: new Date(),
          players: {
            create: [
              { userId },
              { userId: opponentId },
            ],
          },
        },
        include: {
          players: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, avatarUrl: true },
              },
            },
          },
        },
      });

      // Store match info in Redis for quick access
      await this.redis.set(
        `octagon:match:${match.id}`,
        JSON.stringify({ questionIds, currentIndex: 0 }),
        'EX',
        3600,
      );

      return { status: 'matched', match };
    }

    // No opponent found — add to queue
    await this.redis.rpush(this.QUEUE_KEY, String(userId));
    await this.redis.expire(this.QUEUE_KEY, 300); // 5 min TTL

    return { status: 'waiting', message: 'Waiting for opponent' };
  }

  async getMatch(matchId: number) {
    const match = await this.prisma.octagonMatch.findUnique({
      where: { id: matchId },
      include: {
        players: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true },
            },
          },
        },
      },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    // Load questions with answers
    const questions = await this.prisma.question.findMany({
      where: { id: { in: match.questionIds } },
      include: {
        answers: { orderBy: { orderIndex: 'asc' } },
        topic: true,
      },
    });

    return { ...match, questions };
  }

  async submitAnswer(
    matchId: number,
    userId: number,
    dto: { questionId: number; answerId: number; timeSpentSec: number },
  ) {
    const match = await this.prisma.octagonMatch.findUnique({
      where: { id: matchId },
      include: { players: true },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    const player = match.players.find((p) => p.userId === userId);
    if (!player) {
      throw new NotFoundException('Player not in this match');
    }

    // Check if answer is correct
    const correctAnswer = await this.prisma.answer.findFirst({
      where: { questionId: dto.questionId, isCorrect: true },
    });

    const isCorrect = correctAnswer?.id === dto.answerId;

    // Update player score
    if (isCorrect) {
      await this.prisma.octagonPlayer.update({
        where: { id: player.id },
        data: {
          score: { increment: 1 },
          correctCount: { increment: 1 },
        },
      });
    }

    // Track answer in Redis for real-time
    const answerKey = `octagon:match:${matchId}:answers`;
    await this.redis.rpush(
      answerKey,
      JSON.stringify({
        userId,
        questionId: dto.questionId,
        answerId: dto.answerId,
        isCorrect,
        timeSpentSec: dto.timeSpentSec,
      }),
    );

    // Check if match is complete (all players answered all questions)
    const allAnswers = await this.redis.lrange(answerKey, 0, -1);
    const totalExpected = match.questionsCount * match.players.length;

    if (allAnswers.length >= totalExpected) {
      // Determine winner
      const players = await this.prisma.octagonPlayer.findMany({
        where: { matchId },
      });

      const sorted = players.sort((a, b) => b.score - a.score);
      const winner = sorted[0];

      await this.prisma.octagonMatch.update({
        where: { id: matchId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          winnerId: winner.userId,
        },
      });

      await this.prisma.octagonPlayer.update({
        where: { id: winner.id },
        data: { isWinner: true },
      });

      // Update leaderboard
      await this.redis.zincrby('leaderboard:octagon', 1, String(winner.userId));

      return { isCorrect, matchCompleted: true, winnerId: winner.userId };
    }

    return { isCorrect, matchCompleted: false };
  }

  async getHistory(userId: number) {
    const matches = await this.prisma.octagonMatch.findMany({
      where: {
        players: { some: { userId } },
        status: 'COMPLETED',
      },
      include: {
        players: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true },
            },
          },
        },
      },
      orderBy: { completedAt: 'desc' },
      take: 20,
    });

    return matches;
  }

  async getLeaderboard() {
    // Get top 50 from Redis sorted set
    const entries = await this.redis.zrevrange('leaderboard:octagon', 0, 49, 'WITHSCORES');

    const leaderboard: { userId: number; wins: number; user?: any }[] = [];
    for (let i = 0; i < entries.length; i += 2) {
      leaderboard.push({
        userId: Number(entries[i]),
        wins: Number(entries[i + 1]),
      });
    }

    // Enrich with user data
    if (leaderboard.length > 0) {
      const userIds = leaderboard.map((e) => e.userId);
      const users = await this.prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, firstName: true, lastName: true, avatarUrl: true },
      });

      const userMap = new Map(users.map((u) => [u.id, u]));
      for (const entry of leaderboard) {
        entry.user = userMap.get(entry.userId) || null;
      }
    }

    return leaderboard;
  }
}
