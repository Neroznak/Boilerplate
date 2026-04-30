import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { ServiceUnavailableException } from '@nestjs/common';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  check() {
    return {
      status: 'ok',
    };
  }

  @Get('db')
  async checkDb() {
    const status = await this.healthService.checkDb();

    return {
      status,
    };
  }

  @Get('redis')
  async checkRedis() {
    const status = await this.healthService.checkRedis();

    return {
      status,
    };
  }

  @Get('ready')
  async checkReady() {
    const dbStatus = await this.healthService.checkDb();
    const redisStatus = await this.healthService.checkRedis();

    const isOk = dbStatus === 'ok' && redisStatus === 'ok';

    const response = {
      status: isOk ? 'ok' : 'error',
      checks: {
        db: dbStatus,
        redis: redisStatus,
      },
    };

    if (!isOk) {
      throw new ServiceUnavailableException(response);
    }

    return response;
  }
}