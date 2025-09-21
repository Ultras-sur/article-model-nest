import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisRepository implements OnModuleDestroy {
  constructor(@Inject('RedisClient') private readonly redisClient: Redis) {}

  onModuleDestroy(): void {
    this.redisClient.disconnect();
  }

  async get(prefix: string, key: string): Promise<string | null> {
    return this.redisClient.get(`${prefix}:${key}`);
  }

  async set(prefix: string, key: string, value: string): Promise<void> {
    await this.redisClient.set(`${prefix}:${key}`, value);
  }

  async delete(prefix: string, key: string): Promise<void> {
    await this.redisClient.del(`${prefix}:${key}`);
  }

  async setWithExpiry(
    prefix: string,
    key: string,
    value: string,
    expiry: string,
  ): Promise<void> {
    await this.redisClient.set(`${prefix}:${key}`, value, 'EX', expiry);
  }

  async keys(match: string): Promise<any[]> {
    return await this.redisClient.keys(match, (err, keys) => {
      if (err) {
        throw err;
      }
      return keys;
    });
  }

  async getAllKeys(prefix): Promise<any> {
    let cursor = '0';
    function scan(pattern, callback) {
      this.redisClient.scan(cursor,'MATCH', pattern,'COUNT', 1000, (err, reply) => {
          if (err) throw err;
          cursor = reply[0];
          if (cursor !== '0') {
            const keys = reply[1];
            keys.forEach(callback);
            return scan(pattern, callback);
          }
        },
      );
    }
    scan(prefix, console.info);
  }
}