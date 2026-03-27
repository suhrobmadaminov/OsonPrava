import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('overview')
  async getOverview(@CurrentUser('sub') userId: number) {
    return this.statsService.getOverview(userId);
  }

  @Get('weekly')
  async getWeekly(@CurrentUser('sub') userId: number) {
    return this.statsService.getWeekly(userId);
  }

  @Get('topics')
  async getTopicStats(@CurrentUser('sub') userId: number) {
    return this.statsService.getTopicStats(userId);
  }

  @Get('streak')
  async getStreak(@CurrentUser('sub') userId: number) {
    return this.statsService.getStreak(userId);
  }
}
