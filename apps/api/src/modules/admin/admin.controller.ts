import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminGuard } from './guards/admin.guard';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('users')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers(+page, +limit, search);
  }

  @Patch('users/:id/ban')
  async banUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.banUser(id);
  }

  @Patch('users/:id/unban')
  async unbanUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.unbanUser(id);
  }

  @Get('questions')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getQuestions(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.adminService.getQuestions(+page, +limit);
  }

  @Post('questions')
  async createQuestion(@Body() dto: CreateQuestionDto) {
    return this.adminService.createQuestion(dto);
  }

  @Patch('questions/:id')
  async updateQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.adminService.updateQuestion(id, dto);
  }

  @Delete('questions/:id')
  async deleteQuestion(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteQuestion(id);
  }

  @Get('subscriptions')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getSubscriptions(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.adminService.getSubscriptions(+page, +limit);
  }
}
