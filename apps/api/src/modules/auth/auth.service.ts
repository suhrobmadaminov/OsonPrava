import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { TelegramAuthDto } from './dto/telegram-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async loginViaTelegram(dto: TelegramAuthDto) {
    this.verifyTelegramData(dto);

    let user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(dto.id) },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          telegramId: BigInt(dto.id),
          firstName: dto.first_name,
          lastName: dto.last_name,
          username: dto.username,
          avatarUrl: dto.photo_url,
        },
      });
    } else {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: dto.first_name,
          lastName: dto.last_name,
          username: dto.username,
          avatarUrl: dto.photo_url,
          lastActiveAt: new Date(),
        },
      });
    }

    return this.generateTokens(user.id);
  }

  async loginViaTelegramBot(telegramId: number, firstName?: string, lastName?: string, username?: string) {
    let user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          telegramId: BigInt(telegramId),
          firstName,
          lastName,
          username,
        },
      });
    }

    return this.generateTokens(user.id);
  }

  async refreshTokens(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Delete old refresh token
    await this.prisma.refreshToken.delete({ where: { id: stored.id } });

    return this.generateTokens(stored.userId);
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        telegramId: true,
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
        createdAt: true,
      },
    });

    if (!user) throw new UnauthorizedException('User not found');

    return {
      ...user,
      telegramId: user.telegramId?.toString(),
    };
  }

  private async generateTokens(userId: number) {
    const accessToken = this.jwtService.sign({ sub: userId });

    const refreshToken = this.generateRefreshToken();
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES') || '7d';
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(refreshExpiresIn));

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken, expiresAt };
  }

  private generateRefreshToken(): string {
    return randomBytes(64).toString('hex');
  }

  private verifyTelegramData(dto: TelegramAuthDto) {
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!botToken) throw new UnauthorizedException('Bot token not configured');

    const secret = createHmac('sha256', 'WebAppData').update(botToken).digest();
    const checkString = Object.keys(dto)
      .filter((key) => key !== 'hash')
      .sort()
      .map((key) => `${key}=${dto[key]}`)
      .join('\n');

    const hash = createHmac('sha256', secret).update(checkString).digest('hex');

    if (hash !== dto.hash) {
      throw new UnauthorizedException('Invalid Telegram auth data');
    }

    // Check auth_date (max 24 hours old)
    const authDate = parseInt(dto.auth_date);
    if (Date.now() / 1000 - authDate > 86400) {
      throw new UnauthorizedException('Telegram auth data expired');
    }
  }
}
