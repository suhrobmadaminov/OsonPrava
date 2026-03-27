import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TopicsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId?: number) {
    const topics = await this.prisma.topic.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' },
    });

    if (!userId) return topics;

    return Promise.all(
      topics.map(async (topic) => {
        const totalQuestions = await this.prisma.question.count({
          where: { topicId: topic.id, isActive: true },
        });

        const answeredCorrectly = await this.prisma.userQuestionStat.count({
          where: {
            userId,
            question: { topicId: topic.id },
            consecutiveCorrect: { gte: 1 },
          },
        });

        return {
          ...topic,
          totalQuestions,
          answeredCorrectly,
          progress: totalQuestions > 0 ? Math.round((answeredCorrectly / totalQuestions) * 100) : 0,
        };
      }),
    );
  }

  async findOne(id: number) {
    const topic = await this.prisma.topic.findUnique({ where: { id } });
    if (!topic) throw new NotFoundException('Topic not found');
    return topic;
  }

  async getQuestions(topicId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.question.findMany({
        where: { topicId, isActive: true },
        include: { answers: { orderBy: { orderIndex: 'asc' } } },
        skip,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      this.prisma.question.count({ where: { topicId, isActive: true } }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
