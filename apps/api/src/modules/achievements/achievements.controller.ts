import { Controller, Get } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  async findAll(@CurrentUser('sub') userId: number) {
    return this.achievementsService.findAll(userId);
  }

  @Get('my')
  async getMyAchievements(@CurrentUser('sub') userId: number) {
    return this.achievementsService.getMyAchievements(userId);
  }
}
