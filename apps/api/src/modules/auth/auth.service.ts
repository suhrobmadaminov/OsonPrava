import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { TelegramAuthDto } from './dto/telegram-auth.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  // ==================== TELEGRAM AUTH ====================

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
          emailVerified: true,
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
          emailVerified: true,
        },
      });
    }

    return this.generateTokens(user.id);
  }

  // ==================== EMAIL AUTH ====================

  async register(dto: RegisterDto) {
    // Check if email already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    // Check password is not the same as email
    const emailLower = dto.email.toLowerCase();
    const emailPart = emailLower.split('@')[0];
    if (dto.password.toLowerCase().includes(emailPart)) {
      throw new BadRequestException('Password must not contain parts of your email');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Generate verification token
    const verificationToken = randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
        emailVerified: false,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        firstName: user.firstName,
        lastName: user.lastName,
        language: user.language,
        role: user.role,
      },
      verificationToken,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new ForbiddenException(`Account is locked. Try again in ${remaining} minutes`);
    }

    // Validate password
    if (!user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      // Increment login attempts
      const attempts = (user.loginAttempts || 0) + 1;
      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        const lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
        await this.prisma.user.update({
          where: { id: user.id },
          data: { loginAttempts: attempts, lockedUntil },
        });
        throw new ForbiddenException('Too many failed attempts. Account locked for 15 minutes');
      }
      await this.prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts: attempts },
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check email verified
    if (!user.emailVerified) {
      throw new ForbiddenException('Email not verified. Please check your inbox and verify your email.');
    }

    // Reset login attempts on success
    if (user.loginAttempts > 0) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts: 0, lockedUntil: null },
      });
    }

    // Check if user is banned
    if (user.role === 'BANNED') {
      throw new ForbiddenException('Your account has been banned. Contact support for more information.');
    }

    // Update last active
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    return this.generateTokens(user.id);
  }

  async validateEmailPassword(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      return null;
    }

    if (!user.emailVerified) {
      return null;
    }

    if (user.role === 'BANNED') {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return { sub: user.id, email: user.email };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    // Send welcome email
    await this.emailService.sendWelcomeEmail(user.email!, user.firstName, user.language || 'uz').catch(() => {});

    return {
      verified: true,
      user: {
        id: user.id,
        email: user.email,
        emailVerified: true,
        firstName: user.firstName,
        lastName: user.lastName,
        language: user.language,
      },
    };
  }

  async forgotPassword(email: string, lang?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success (don't reveal if email exists)
    if (!user || !user.passwordHash) {
      return { success: true, message: 'If the email exists, a reset link has been sent' };
    }

    const resetToken = randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    // Send reset email
    await this.emailService.sendPasswordResetEmail(user.email!, resetToken, lang || 'uz').catch(() => {});

    return { success: true, message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Validate password strength
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasDigit = /\d/.test(newPassword);
    const hasMinLength = newPassword.length >= 8;
    if (!hasUpper || !hasLower || !hasDigit || !hasMinLength) {
      throw new BadRequestException('Password must be at least 8 characters with uppercase, lowercase, and number');
    }

    // Check password not same as email
    const emailLower = user.email!.toLowerCase();
    const emailPart = emailLower.split('@')[0];
    if (newPassword.toLowerCase().includes(emailPart)) {
      throw new BadRequestException('Password must not contain parts of your email');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password, clear reset token, invalidate all refresh tokens
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          resetPasswordToken: null,
          resetPasswordExpires: null,
          loginAttempts: 0,
          lockedUntil: null,
        },
      }),
      this.prisma.refreshToken.deleteMany({
        where: { userId: user.id },
      }),
    ]);

    return { success: true, message: 'Password reset successfully' };
  }

  async resendVerificationEmail(email: string, lang?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return { success: true, message: 'If the email exists, a verification link has been sent' };
    }

    if (user.emailVerified) {
      return { success: true, message: 'Email already verified' };
    }

    // Generate new token
    const verificationToken = randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    // Send verification email
    await this.emailService.sendVerificationEmail(user.email!, verificationToken, lang || 'uz').catch(() => {});

    return { success: true, message: 'Verification email sent', verificationToken };
  }

  async linkEmailToTelegramAccount(userId: number, email: string) {
    const existing = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing && existing.id !== userId) {
      throw new ConflictException('Email already linked to another account');
    }

    const verificationToken = randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: email.toLowerCase(),
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    return { verificationToken, email };
  }

  // ==================== COMMON ====================

  async refreshTokens(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Check if user is banned
    if (stored.user.role === 'BANNED') {
      throw new ForbiddenException('Your account has been banned');
    }

    // Delete old refresh token (rotation)
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
        email: true,
        emailVerified: true,
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

    // Parse expiry duration (e.g., "7d" -> 7 days)
    const match = refreshExpiresIn.match(/^(\d+)([dhyms])$/);
    const expiresAt = new Date();
    if (match) {
      const [, num, unit] = match;
      const n = parseInt(num);
      switch (unit) {
        case 'd': expiresAt.setDate(expiresAt.getDate() + n); break;
        case 'h': expiresAt.setHours(expiresAt.getHours() + n); break;
        case 'm': expiresAt.setMinutes(expiresAt.getMinutes() + n); break;
        case 's': expiresAt.setSeconds(expiresAt.getSeconds() + n); break;
        case 'y': expiresAt.setFullYear(expiresAt.getFullYear() + n); break;
      }
    } else {
      expiresAt.setDate(expiresAt.getDate() + 7);
    }

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
