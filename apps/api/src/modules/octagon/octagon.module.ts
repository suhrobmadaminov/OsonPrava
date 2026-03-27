import { Module } from '@nestjs/common';
import { OctagonService } from './octagon.service';
import { OctagonController } from './octagon.controller';
import { OctagonGateway } from './gateway/octagon.gateway';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OctagonController],
  providers: [OctagonService, OctagonGateway],
  exports: [OctagonService],
})
export class OctagonModule {}
