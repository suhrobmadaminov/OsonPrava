import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @ApiBearerAuth()
  @Get()
  findAll(@CurrentUser('sub') userId: number) {
    return this.ticketsService.findAll(userId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.findOne(id);
  }

  @Public()
  @Get(':id/questions')
  getQuestions(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.getQuestions(id);
  }
}
