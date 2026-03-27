import { Controller, Get, Param, Query } from '@nestjs/common';
import { BlogService } from './blog.service';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Public()
  @Get()
  async findAll(
    @Query() pagination: PaginationDto,
    @Query('category') category?: string,
  ) {
    return this.blogService.findAll(pagination, category);
  }

  @Public()
  @Get('categories')
  async getCategories() {
    return this.blogService.getCategories();
  }

  @Public()
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }
}
