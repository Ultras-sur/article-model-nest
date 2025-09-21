import { Injectable } from '@nestjs/common';
import { RedisRepository } from './redis.repository';

@Injectable()
export class RedisCacheService {
  constructor(private readonly redisRepository: RedisRepository) {}

  async getCachedData(prefix: string, id: string) {
    const data = await this.redisRepository.get(prefix, id);
    return JSON.parse(data);
  }

  async setCachedDataWithExpiry(prefix: string, key: string, value: string, expiry: string): Promise<void> {
    await this.redisRepository.setWithExpiry(prefix, key, value, expiry)
  }

  async deleteCachedData(prefix: string, key: string) {
    await this.redisRepository.delete(prefix, key);
  }

  async getCachedKeys(prefix: string) {
    const data = await this.redisRepository.keys(prefix)
    return data;
  }

  async clearCache(prefix: string) {
    const matchedKeys: string[] = await this.getCachedKeys(`${prefix}:*`)
    await Promise.all(matchedKeys.map(async (matchedKey) => {
      const [prefix, key] = matchedKey.split(':');
        await this.deleteCachedData(prefix, key);
    }))
  }
}