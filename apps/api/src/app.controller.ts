import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { RedisService } from './redis.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
              private readonly prisma: PrismaService,
              private readonly redis: RedisService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health/db')
  async dbHealth() {
    const usersCount = await this.prisma.user.count();
    console.log("test");
    return {
      status: 'ok',
      usersCount,
    };
  }

  @Get('health/redis')
  async redisHealth() {
    const result = await this.redis.ping();

    return {
      status: result === 'PONG' ? 'ok' : 'error',
    };
  }
}
