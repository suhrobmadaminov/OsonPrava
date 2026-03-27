import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [usersCount, questionsCount, activeSubscriptions, todayTests] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.question.count(),
        this.prisma.subscription.count({
          where: { status: 'ACTIVE' },
        }),
        this.prisma.testSession.count({
          where: { startedAt: { gte: today } },
        }),
      ]);

    return {
      usersCount,
      questionsCount,
      activeSubscriptions,
      todayTests,
    };
  }

  async getUsers(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
            { username: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          telegramId: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          isPremium: true,
          createdAt: true,
          lastActiveAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((u) => ({
        ...u,
        telegramId: u.telegramId?.toString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async banUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'BANNED' as any, isPremium: false },
    });

    return { message: 'User banned successfully' };
  }

  async unbanUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'USER' },
    });

    return { message: 'User unbanned successfully' };
  }

  async getQuestions(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
      this.prisma.question.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          answers: true,
          topic: {
            select: {
              id: true,
              nameUz: true,
              nameRu: true,
            },
          },
        },
      }),
      this.prisma.question.count(),
    ]);

    return {
      data: questions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createQuestion(dto: CreateQuestionDto) {
    const question = await this.prisma.question.create({
      data: {
        textUz: dto.textUz,
        textUzCyr: dto.textCyr,
        textRu: dto.textRu,
        topicId: dto.topicId,
        answers: {
          create: dto.answers.map((answer, index) => ({
            textUz: answer.textUz,
            textUzCyr: answer.textCyr,
            textRu: answer.textRu,
            isCorrect: answer.isCorrect,
            orderIndex: index,
          })),
        },
      },
      include: { answers: true },
    });

    // Link to ticket
    await this.prisma.ticketQuestion.create({
      data: {
        ticketId: dto.ticketId,
        questionId: question.id,
      },
    });

    return question;
  }

  async updateQuestion(id: number, dto: UpdateQuestionDto) {
    const existing = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Question not found');
    }

    const question = await this.prisma.question.update({
      where: { id },
      data: {
        ...(dto.textUz !== undefined && { textUz: dto.textUz }),
        ...(dto.textCyr !== undefined && { textUzCyr: dto.textCyr }),
        ...(dto.textRu !== undefined && { textRu: dto.textRu }),
        ...(dto.topicId !== undefined && { topicId: dto.topicId }),
      },
      include: { answers: true },
    });

    if (dto.answers) {
      await this.prisma.answer.deleteMany({
        where: { questionId: id },
      });

      await this.prisma.answer.createMany({
        data: dto.answers.map((answer, index) => ({
          questionId: id,
          textUz: answer.textUz,
          textUzCyr: answer.textCyr,
          textRu: answer.textRu,
          isCorrect: answer.isCorrect,
          orderIndex: index,
        })),
      });
    }

    return this.prisma.question.findUnique({
      where: { id },
      include: { answers: true },
    });
  }

  async deleteQuestion(id: number) {
    const existing = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Question not found');
    }

    await this.prisma.question.delete({
      where: { id },
    });

    return { message: 'Question deleted successfully' };
  }

  async getSubscriptions(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [subscriptions, total] = await Promise.all([
      this.prisma.subscription.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
            },
          },
        },
      }),
      this.prisma.subscription.count(),
    ]);

    return {
      data: subscriptions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
