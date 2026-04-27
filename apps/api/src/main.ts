import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { APP_NAME } from "@repo/shared";
import { NODE_ENV } from "@repo/config";
import { REDIS_URL } from '@repo/config';




async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  console.log(APP_NAME);
  console.log('NODE_ENV:', NODE_ENV);
  console.log('REDIS_URL:', REDIS_URL);

  app.enableShutdownHooks();

  const port = Number(process.env.PORT) || 5000;
  await app.listen(port, '0.0.0.0');
}

bootstrap();
