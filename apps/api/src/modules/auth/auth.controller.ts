import { Controller, Post, Get, Body, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { TelegramAuthDto } from './dto/telegram-auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('telegram')
  async loginViaTelegram(@Body() dto: TelegramAuthDto) {
    return this.authService.loginViaTelegram(dto);
  }

  @Public()
  @Post('telegram-bot')
  async loginViaTelegramBot(
    @Body() body: { telegramId: number; firstName?: string; lastName?: string; username?: string },
  ) {
    return this.authService.loginViaTelegramBot(
      body.telegramId,
      body.firstName,
      body.lastName,
      body.username,
    );
  }

  @Public()
  @Post('refresh')
  async refreshTokens(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @ApiBearerAuth()
  @Post('logout')
  async logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @ApiBearerAuth()
  @Get('me')
  async getMe(@CurrentUser('sub') userId: number) {
    return this.authService.getMe(userId);
  }
}
