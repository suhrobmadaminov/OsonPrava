import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { REDIS_CLIENT } from '../../config/redis.module';
import Redis from 'ioredis';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class QuestionsService {
  constructor(
    private prisma: PrismaService,
    @Inject(REDIS_CLIENT) private redis: Redis,
  ) {}

  async findAll(pagination: PaginationDto, topicId?: number) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      ...(topicId && { topicId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.question.findMany({
        where,
        include: {
          answers: { orderBy: { orderIndex: 'asc' } },
          topic: { select: { id: true, nameUz: true, nameRu: true, slug: true } },
        },
        skip,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      this.prisma.question.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    // Try cache first
    const cached = await this.redis.get(`question:${id}`);
    if (cached) return JSON.parse(cached);

    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        answers: { orderBy: { orderIndex: 'asc' } },
        topic: { select: { id: true, nameUz: true, nameRu: true, slug: true } },
      },
    });

    if (!question) throw new NotFoundException('Question not found');

    // Cache for 1 hour
    await this.redis.set(`question:${id}`, JSON.stringify(question), 'EX', 3600);

    return question;
  }

  async findRandom(count: number = 1) {
    const total = await this.prisma.question.count({ where: { isActive: true } });
    const skip = Math.floor(Math.random() * Math.max(0, total - count));

    return this.prisma.question.findMany({
      where: { isActive: true },
      include: {
        answers: { orderBy: { orderIndex: 'asc' } },
        topic: { select: { id: true, nameUz: true, nameRu: true, slug: true } },
      },
      skip,
      take: count,
    });
  }

  async search(query: string, pagination: PaginationDto) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      OR: [
        { textUz: { contains: query, mode: 'insensitive' as const } },
        { textRu: { contains: query, mode: 'insensitive' as const } },
        { textUzCyr: { contains: query, mode: 'insensitive' as const } },
      ],
    };

    const [data, total] = await Promise.all([
      this.prisma.question.findMany({
        where,
        include: { answers: { orderBy: { orderIndex: 'asc' } } },
        skip,
        take: limit,
      }),
      this.prisma.question.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
