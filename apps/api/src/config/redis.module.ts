import { Global, Module, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
        const logger = new Logger('RedisModule');
        
        const redis = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          retryStrategy: (times) => {
            if (times > 10) {
              logger.warn('Redis connection failed, stopping retries');
              return null; // Stop retrying
            }
            const delay = Math.min(times * 1000, 5000);
            logger.warn(`Redis connection attempt ${times}, retrying in ${delay}ms`);
            return delay;
          },
        });

        redis.on('error', (error) => {
          logger.warn('Redis connection error:', error.message);
        });

        redis.on('connect', () => {
          logger.log('Redis connection established');
        });

        return redis;
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
