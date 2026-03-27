import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Language } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        telegramId: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        language: true,
        role: true,
        isPremium: true,
        premiumExpiresAt: true,
        streak: true,
        longestStreak: true,
        lastActiveAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      telegramId: user.telegramId?.toString(),
    };
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    if (dto.username) {
      const existing = await this.prisma.user.findFirst({
        where: {
          username: dto.username,
          id: { not: userId },
        },
      });

      if (existing) {
        throw new ConflictException('Username is already taken');
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.username !== undefined && { username: dto.username }),
      },
      select: {
        id: true,
        telegramId: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        language: true,
        role: true,
        isPremium: true,
        streak: true,
        longestStreak: true,
        lastActiveAt: true,
        createdAt: true,
      },
    });

    return {
      ...user,
      telegramId: user.telegramId?.toString(),
    };
  }

  async changeLanguage(userId: number, language: Language) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { language },
      select: {
        id: true,
        language: true,
      },
    });

    return user;
  }

  async getStats(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { streak: true, longestStreak: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const aggregation = await this.prisma.testSession.aggregate({
      where: { userId },
      _count: { id: true },
      _sum: {
        totalQuestions: true,
        correctAnswers: true,
      },
    });

    const passedTests = await this.prisma.testSession.count({
      where: { userId, isPassed: true },
    });

    return {
      totalTests: aggregation._count.id,
      passedTests,
      totalQuestions: aggregation._sum.totalQuestions ?? 0,
      correctAnswers: aggregation._sum.correctAnswers ?? 0,
      streak: user.streak,
      longestStreak: user.longestStreak,
    };
  }

  async deleteAccount(userId: number) {
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'Account deleted successfully' };
  }
}
