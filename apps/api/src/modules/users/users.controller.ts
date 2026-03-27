import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Language } from '@prisma/client';
import { IsEnum } from 'class-validator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class ChangeLanguageDto {
  @IsEnum(Language)
  language: Language;
}

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  async getProfile(@CurrentUser('sub') userId: number) {
    return this.usersService.getProfile(userId);
  }

  @Patch('profile')
  async updateProfile(
    @CurrentUser('sub') userId: number,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Patch('language')
  async changeLanguage(
    @CurrentUser('sub') userId: number,
    @Body() dto: ChangeLanguageDto,
  ) {
    return this.usersService.changeLanguage(userId, dto.language);
  }

  @Get('stats')
  async getStats(@CurrentUser('sub') userId: number) {
    return this.usersService.getStats(userId);
  }

  @Delete('account')
  async deleteAccount(@CurrentUser('sub') userId: number) {
    return this.usersService.deleteAccount(userId);
  }
}
