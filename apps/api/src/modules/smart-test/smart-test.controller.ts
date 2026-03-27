import { Controller, Post, Get } from '@nestjs/common';
import { SmartTestService } from './smart-test.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('smart-test')
export class SmartTestController {
  constructor(private readonly smartTestService: SmartTestService) {}

  @Post('start')
  async startSmartTest(@CurrentUser('sub') userId: number) {
    return this.smartTestService.startSmartTest(userId);
  }

  @Get('stats')
  async getStats(@CurrentUser('sub') userId: number) {
    return this.smartTestService.getStats(userId);
  }
}
