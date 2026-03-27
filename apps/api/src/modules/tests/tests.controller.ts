import { Controller, Post, Get, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TestsService } from './tests.service';
import { StartTestDto } from './dto/start-test.dto';
import { AnswerDto } from './dto/answer.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Tests')
@ApiBearerAuth()
@Controller('tests')
export class TestsController {
  constructor(private testsService: TestsService) {}

  @Post('start')
  startTest(@CurrentUser('sub') userId: number, @Body() dto: StartTestDto) {
    return this.testsService.startTest(userId, dto);
  }

  @Post(':id/answer')
  answerQuestion(
    @CurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) sessionId: number,
    @Body() dto: AnswerDto,
  ) {
    return this.testsService.answerQuestion(userId, sessionId, dto);
  }

  @Post(':id/complete')
  completeTest(@CurrentUser('sub') userId: number, @Param('id', ParseIntPipe) sessionId: number) {
    return this.testsService.completeTest(userId, sessionId);
  }

  @Get(':id')
  getTestResult(@CurrentUser('sub') userId: number, @Param('id', ParseIntPipe) sessionId: number) {
    return this.testsService.getTestResult(userId, sessionId);
  }

  @Get('history')
  getHistory(@CurrentUser('sub') userId: number, @Query() pagination: PaginationDto) {
    return this.testsService.getHistory(userId, pagination.page, pagination.limit);
  }
}
