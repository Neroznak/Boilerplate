import { Injectable } from '@nestjs/common';
import { PrismaService } from '@repo/database';
import { RedisService } from '../redis.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async checkDb(): Promise<'ok' | 'error'> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'ok';
    } catch {
      return 'error';
    }
  }

  async checkRedis(): Promise<'ok' | 'error'> {
    try {
      const result = await this.redis.ping();
      return result === 'PONG' ? 'ok' : 'error';
    } catch {
      return 'error';
    }
  }


}