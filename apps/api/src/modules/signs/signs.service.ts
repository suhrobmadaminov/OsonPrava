import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SignCategory } from '@prisma/client';

@Injectable()
export class SignsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(category?: string) {
    const where: any = {};
    if (category) {
      where.category = category as SignCategory;
    }

    const signs = await this.prisma.roadSign.findMany({
      where,
      orderBy: [{ category: 'asc' }, { orderIndex: 'asc' }],
    });

    return signs;
  }

  async findOne(id: number) {
    const sign = await this.prisma.roadSign.findUnique({
      where: { id },
    });

    if (!sign) {
      throw new NotFoundException('Road sign not found');
    }

    return sign;
  }

  async getCategories() {
    const categories = Object.values(SignCategory).map((cat) => ({
      key: cat,
      label: cat.charAt(0) + cat.slice(1).toLowerCase(),
    }));

    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await this.prisma.roadSign.count({
          where: { category: cat.key as SignCategory },
        });
        return { ...cat, count };
      }),
    );

    return categoriesWithCount.filter((c) => c.count > 0);
  }
}
