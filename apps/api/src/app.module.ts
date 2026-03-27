import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './config/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { TopicsModule } from './modules/topics/topics.module';
import { TestsModule } from './modules/tests/tests.module';
import { SmartTestModule } from './modules/smart-test/smart-test.module';
import { OctagonModule } from './modules/octagon/octagon.module';
import { StatsModule } from './modules/stats/stats.module';
import { AchievementsModule } from './modules/achievements/achievements.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { BlogModule } from './modules/blog/blog.module';
import { SignsModule } from './modules/signs/signs.module';
import { HealthModule } from './modules/health/health.module';
import { AdminModule } from './modules/admin/admin.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { FilesModule } from './modules/files/files.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    ScheduleModule.forRoot(),
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    QuestionsModule,
    TicketsModule,
    TopicsModule,
    TestsModule,
    SmartTestModule,
    OctagonModule,
    StatsModule,
    AchievementsModule,
    LeaderboardModule,
    SubscriptionModule,
    BlogModule,
    SignsModule,
    HealthModule,
    AdminModule,
    NotificationsModule,
    FilesModule,
  ],
})
export class AppModule {}
