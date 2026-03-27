import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { REDIS_CLIENT } from '../../config/redis.module';
import Redis from 'ioredis';

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    @Inject(REDIS_CLIENT) private redis: Redis,
  ) {}

  async findAll(userId?: number) {
    const tickets = await this.prisma.ticket.findMany({
      where: { isActive: true },
      orderBy: { number: 'asc' },
    });

    if (!userId) return tickets;

    // Add user progress for each ticket
    const progress = await Promise.all(
      tickets.map(async (ticket) => {
        const sessions = await this.prisma.testSession.findMany({
          where: { userId, type: 'TICKET', ticketId: ticket.id },
          orderBy: { completedAt: 'desc' },
          take: 1,
        });

        const bestSession = await this.prisma.testSession.findFirst({
          where: { userId, type: 'TICKET', ticketId: ticket.id, completedAt: { not: null } },
          orderBy: { score: 'desc' },
        });

        return {
          ...ticket,
          lastAttempt: sessions[0] || null,
          bestScore: bestSession?.score || null,
          isPassed: bestSession?.isPassed || false,
        };
      }),
    );

    return progress;
  }

  async findOne(id: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        ticketQuestions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            question: {
              include: {
                answers: { orderBy: { orderIndex: 'asc' } },
                topic: { select: { id: true, nameUz: true, nameRu: true } },
              },
            },
          },
        },
      },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async getQuestions(ticketId: number) {
    const cacheKey = `ticket:${ticketId}:questions`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const ticketQuestions = await this.prisma.ticketQuestion.findMany({
      where: { ticketId },
      orderBy: { orderIndex: 'asc' },
      include: {
        question: {
          include: {
            answers: { orderBy: { orderIndex: 'asc' } },
            topic: { select: { id: true, nameUz: true, nameRu: true } },
          },
        },
      },
    });

    if (!ticketQuestions.length) throw new NotFoundException('Ticket not found');

    const questions = ticketQuestions.map((tq) => tq.question);
    await this.redis.set(cacheKey, JSON.stringify(questions), 'EX', 3600);

    return questions;
  }
}
