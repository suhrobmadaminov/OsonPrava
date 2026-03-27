import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { SignsService } from './signs.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('signs')
export class SignsController {
  constructor(private readonly signsService: SignsService) {}

  @Public()
  @Get()
  async findAll(@Query('category') category?: string) {
    return this.signsService.findAll(category);
  }

  @Public()
  @Get('categories')
  async getCategories() {
    return this.signsService.getCategories();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.signsService.findOne(id);
  }
}
