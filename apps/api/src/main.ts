import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { APP_NAME } from '@repo/shared';
import { config } from '@repo/config';
import { Logger as PinoLogger } from 'nestjs-pino';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import * as Sentry from '@sentry/nestjs';

Sentry.init({
  dsn: config.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.useLogger(app.get(PinoLogger));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const logger = app.get(PinoLogger);

  logger.log(APP_NAME);
  logger.log(`NODE_ENV: ${config.NODE_ENV}`);
  logger.log(`REDIS_URL: ${config.REDIS_URL}`);
  app.enableShutdownHooks();

  await app.listen(config.PORT, '0.0.0.0');
}

bootstrap();
