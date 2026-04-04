import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword123'),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn().mockResolvedValue([]),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mockAccessToken'),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'JWT_ACCESS_SECRET') return 'test-secret';
      if (key === 'JWT_ACCESS_EXPIRES') return '15m';
      if (key === 'JWT_REFRESH_EXPIRES') return '7d';
      if (key === 'TELEGRAM_BOT_TOKEN') return 'test-bot-token';
      return null;
    }),
  };

  const mockEmailService = {
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'StrongPass123',
      confirmPassword: 'StrongPass123',
    };

    it('should register a new user successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        passwordHash: 'hashedPassword123',
        emailVerified: false,
        emailVerificationToken: 'token123',
        firstName: null,
        lastName: null,
        language: 'UZ_LATIN',
        role: 'USER',
      });
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.register(registerDto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('StrongPass123', 10);
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result.accessToken).toBe('mockAccessToken');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.emailVerified).toBe(false);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'test@example.com' });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if password contains email', async () => {
      const badDto = { ...registerDto, password: 'test@example123A' };
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.register(badDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'StrongPass123',
    };

    const mockUser = {
      id: 1,
      email: 'test@example.com',
      passwordHash: 'hashedPassword123',
      emailVerified: true,
      loginAttempts: 0,
      lockedUntil: null,
      role: 'USER',
      firstName: null,
      lastName: null,
      language: 'UZ_LATIN',
    };

    it('should login successfully with valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.login(loginDto);

      expect(result.accessToken).toBe('mockAccessToken');
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw ForbiddenException for unverified email', async () => {
      const unverifiedUser = { ...mockUser, emailVerified: false };
      mockPrisma.user.findUnique.mockResolvedValue(unverifiedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException for banned user', async () => {
      const bannedUser = { ...mockUser, role: 'BANNED' };
      mockPrisma.user.findUnique.mockResolvedValue(bannedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(ForbiddenException);
    });

    it('should lock account after 5 failed attempts', async () => {
      const userWithAttempts = { ...mockUser, loginAttempts: 4 };
      mockPrisma.user.findUnique.mockResolvedValue(userWithAttempts);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(ForbiddenException);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ lockedUntil: expect.any(Date) }),
        }),
      );
    });

    it('should throw if account is currently locked', async () => {
      const lockedUser = { ...mockUser, lockedUntil: new Date(Date.now() + 900000) };
      mockPrisma.user.findUnique.mockResolvedValue(lockedUser);

      await expect(service.login(loginDto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        emailVerified: false,
        emailVerificationToken: 'validToken',
        emailVerificationExpires: new Date(Date.now() + 3600000),
        firstName: null,
        language: 'UZ_LATIN',
      };

      mockPrisma.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.verifyEmail('validToken');

      expect(result.verified).toBe(true);
      expect(result.user.emailVerified).toBe(true);
    });

    it('should throw BadRequestException for invalid token', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(service.verifyEmail('invalidToken')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for expired token', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 1,
        emailVerificationToken: 'expiredToken',
        emailVerificationExpires: new Date(Date.now() - 3600000),
      });

      await expect(service.verifyEmail('expiredToken')).rejects.toThrow(BadRequestException);
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        resetPasswordToken: 'validToken',
        resetPasswordExpires: new Date(Date.now() + 3600000),
      });
      mockPrisma.$transaction.mockResolvedValue([]);

      const result = await service.resetPassword('validToken', 'NewStrongPass456');

      expect(result.success).toBe(true);
      expect(bcrypt.hash).toHaveBeenCalledWith('NewStrongPass456', 10);
    });

    it('should throw BadRequestException for invalid token', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(service.resetPassword('invalidToken', 'NewStrongPass456')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for weak new password', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        resetPasswordToken: 'validToken',
        resetPasswordExpires: new Date(Date.now() + 3600000),
      });

      await expect(service.resetPassword('validToken', 'weak')).rejects.toThrow(BadRequestException);
    });

    it('should invalidate all refresh tokens after password reset', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        resetPasswordToken: 'validToken',
        resetPasswordExpires: new Date(Date.now() + 3600000),
      });
      mockPrisma.$transaction.mockResolvedValue([]);

      await service.resetPassword('validToken', 'NewStrongPass456');

      expect(mockPrisma.$transaction).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({}),
        ]),
      );
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens with valid refresh token', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 1,
        token: 'validRefreshToken',
        userId: 1,
        expiresAt: new Date(Date.now() + 3600000),
        user: { id: 1, role: 'USER' },
      });
      mockPrisma.refreshToken.delete.mockResolvedValue({});
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.refreshTokens('validRefreshToken');

      expect(result.accessToken).toBe('mockAccessToken');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refreshTokens('invalidToken')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw ForbiddenException for banned user', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 1,
        token: 'validToken',
        userId: 1,
        expiresAt: new Date(Date.now() + 3600000),
        user: { id: 1, role: 'BANNED' },
      });

      await expect(service.refreshTokens('validToken')).rejects.toThrow(ForbiddenException);
    });
  });
});
