import { Module } from '@nestjs/common';
import { SmartTestService } from './smart-test.service';
import { SmartTestController } from './smart-test.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SmartTestController],
  providers: [SmartTestService],
  exports: [SmartTestService],
})
export class SmartTestModule {}
