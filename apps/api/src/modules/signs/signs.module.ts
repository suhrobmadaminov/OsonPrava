import { Module } from '@nestjs/common';
import { SignsService } from './signs.service';
import { SignsController } from './signs.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SignsController],
  providers: [SignsService],
  exports: [SignsService],
})
export class SignsModule {}
