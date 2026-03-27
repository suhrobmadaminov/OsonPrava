import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { QuestionsService } from './questions.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Questions')
@Controller('questions')
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @Public()
  @Get()
  findAll(@Query() pagination: PaginationDto, @Query('topicId') topicId?: number) {
    return this.questionsService.findAll(pagination, topicId);
  }

  @Public()
  @Get('random')
  findRandom(@Query('count') count?: number) {
    return this.questionsService.findRandom(count || 1);
  }

  @Public()
  @Get('search')
  search(@Query('q') query: string, @Query() pagination: PaginationDto) {
    return this.questionsService.search(query, pagination);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.questionsService.findOne(id);
  }
}
