import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { EmailService } from '../email/email.service';
import { TelegramAuthDto } from './dto/telegram-auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private emailService: EmailService,
  ) { }

  // ==================== TELEGRAM AUTH ====================

  @Public()
  @Post('telegram')
  @ApiOperation({ summary: 'Login via Telegram WebApp widget' })
  async loginViaTelegram(@Body() dto: TelegramAuthDto) {
    return this.authService.loginViaTelegram(dto);
  }

  @Public()
  @Post('telegram-bot')
  @ApiOperation({ summary: 'Login via Telegram bot (initData)' })
  async loginViaTelegramBot(
    @Body() body: { initData: string },
  ) {
    return this.authService.loginViaTelegramBot(body.initData);
  }

  // ==================== EMAIL AUTH ====================

  @Public()
  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 3600 } })
  @ApiOperation({ summary: 'Register with email and password' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async register(@Body() dto: RegisterDto, @Req() req: any) {
    const result = await this.authService.register(dto);

    // Send verification email
    const lang = req.headers['accept-language']?.split(',')[0] || 'uz';
    await this.emailService.sendVerificationEmail(dto.email, result.verificationToken, lang).catch(() => { });

    const { verificationToken: _, ...responseWithoutToken } = result;
    return {
      accessToken: responseWithoutToken.accessToken,
      refreshToken: responseWithoutToken.refreshToken,
      user: responseWithoutToken.user,
      message: 'Verification email sent. Please check your inbox.',
    };
  }

  @Public()
  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 900 } })
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Account locked or email not verified' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email with token' })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Public()
  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 3600 } })
  @ApiOperation({ summary: 'Request password reset email' })
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: any) {
    const lang = req.headers['accept-language']?.split(',')[0] || 'uz';
    const result = await this.authService.forgotPassword(dto.email, lang);
    return result;
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Public()
  @Post('resend-verify')
  @Throttle({ default: { limit: 3, ttl: 3600 } })
  @ApiOperation({ summary: 'Resend verification email' })
  async resendVerify(@Body() dto: { email: string }, @Req() req: any) {
    const lang = req.headers['accept-language']?.split(',')[0] || 'uz';
    const result = await this.authService.resendVerificationEmail(dto.email, lang);
    return result;
  }

  // ==================== COMMON ====================

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refreshTokens(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  async logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@CurrentUser('sub') userId: number) {
    return this.authService.getMe(userId);
  }

  @ApiBearerAuth()
  @Post('link-email')
  @Throttle({ default: { limit: 5, ttl: 3600 } })
  @ApiOperation({ summary: 'Link email to current account (from Telegram bot)' })
  async linkEmail(@Body() body: { email: string }, @CurrentUser('sub') userId: number, @Req() req: any) {
    const lang = req.headers['accept-language']?.split(',')[0] || 'uz';
    const result = await this.authService.linkEmailToTelegramAccount(userId, body.email);

    // Send verification email
    await this.emailService.sendVerificationEmail(body.email, result.verificationToken, lang).catch(() => { });

    return { success: true, message: 'Email linked. Please verify via email.' };
  }
}
