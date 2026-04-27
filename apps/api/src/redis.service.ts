import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_URL } from '@repo/config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly client = new Redis(REDIS_URL);

  async onModuleInit() {
    await this.client.ping();
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async ping() {
    return this.client.ping();
  }
}