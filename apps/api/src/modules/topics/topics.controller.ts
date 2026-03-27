import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TopicsService } from './topics.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Topics')
@Controller('topics')
export class TopicsController {
  constructor(private topicsService: TopicsService) {}

  @ApiBearerAuth()
  @Get()
  findAll(@CurrentUser('sub') userId: number) {
    return this.topicsService.findAll(userId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.topicsService.findOne(id);
  }

  @Public()
  @Get(':id/questions')
  getQuestions(@Param('id', ParseIntPipe) id: number, @Query() pagination: PaginationDto) {
    return this.topicsService.getQuestions(id, pagination.page, pagination.limit);
  }
}
