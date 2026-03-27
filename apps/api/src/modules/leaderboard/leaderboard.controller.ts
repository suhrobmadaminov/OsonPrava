import { Controller, Get } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  async getGeneral() {
    return this.leaderboardService.getGeneral();
  }

  @Get('weekly')
  async getWeekly() {
    return this.leaderboardService.getWeekly();
  }

  @Get('octagon')
  async getOctagon() {
    return this.leaderboardService.getOctagon();
  }
}
