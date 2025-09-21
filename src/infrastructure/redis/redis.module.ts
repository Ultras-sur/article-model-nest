import { Module } from '@nestjs/common';
import { redisClientFactory } from './redis.client.factory';
import { RedisRepository } from './redis.repository';
import { RedisCacheService } from './redis-cache.service';

@Module({
  imports: [],
  controllers: [],
  providers: [redisClientFactory, RedisRepository, RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisModule {}