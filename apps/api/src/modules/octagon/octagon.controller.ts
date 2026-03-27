import { Controller, Post, Get, Param, Body, ParseIntPipe } from '@nestjs/common';
import { OctagonService } from './octagon.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('octagon')
export class OctagonController {
  constructor(private readonly octagonService: OctagonService) {}

  @Post('find-match')
  async findMatch(@CurrentUser('sub') userId: number) {
    return this.octagonService.findMatch(userId);
  }

  @Get('match/:id')
  async getMatch(@Param('id', ParseIntPipe) matchId: number) {
    return this.octagonService.getMatch(matchId);
  }

  @Post('match/:id/answer')
  async submitAnswer(
    @Param('id', ParseIntPipe) matchId: number,
    @CurrentUser('sub') userId: number,
    @Body() dto: { questionId: number; answerId: number; timeSpentSec: number },
  ) {
    return this.octagonService.submitAnswer(matchId, userId, dto);
  }

  @Get('history')
  async getHistory(@CurrentUser('sub') userId: number) {
    return this.octagonService.getHistory(userId);
  }

  @Get('leaderboard')
  async getLeaderboard() {
    return this.octagonService.getLeaderboard();
  }
}
