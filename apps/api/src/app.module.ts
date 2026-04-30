import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from '@repo/database';
import { RedisService } from './redis.service';
import { HealthController } from './health/health.controller';
import { HealthService } from './health/health.service';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './auth/auth.module';
import { BullModule } from '@nestjs/bullmq';
import { REDIS_URL } from '@repo/config';
import { QueuesModule } from './queues/queues.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production'
          ? {
            target: 'pino-pretty',
            options: { singleLine: true },
          }
          : undefined,
        serializers: {
          req(req) {
            return {
              id: req.id,
              method: req.method,
              url: req.url,
            };
          },
        },
      },
    }),
    AuthModule,
    BullModule.forRoot({
      connection: {
        url: REDIS_URL,
      },
    }),
    QueuesModule
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, PrismaService, RedisService, HealthService],
})
export class AppModule {}
