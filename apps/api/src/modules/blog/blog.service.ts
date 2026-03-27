import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto, PaginatedResponse } from '../../common/dto/pagination.dto';
import { BlogPost } from '@prisma/client';

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    pagination: PaginationDto,
    category?: string,
  ): Promise<PaginatedResponse<BlogPost>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where: any = { isPublished: true };
    if (category) {
      where.category = category;
    }

    const [data, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          slug: true,
          titleUz: true,
          titleUzCyr: true,
          titleRu: true,
          excerptUz: true,
          excerptUzCyr: true,
          excerptRu: true,
          imageUrl: true,
          category: true,
          tags: true,
          publishedAt: true,
          viewCount: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return {
      data: data as any,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    // Increment view count
    await this.prisma.blogPost.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
    });

    return { ...post, viewCount: post.viewCount + 1 };
  }

  async getCategories() {
    const posts = await this.prisma.blogPost.findMany({
      where: { isPublished: true },
      select: { category: true },
      distinct: ['category'],
    });

    const categories = await Promise.all(
      posts.map(async (p) => {
        const count = await this.prisma.blogPost.count({
          where: { isPublished: true, category: p.category },
        });
        return { name: p.category, count };
      }),
    );

    return categories;
  }
}
