import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '@repo/database';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { config } from '@repo/config';
import type { StringValue } from 'ms';
import { QueuesModule } from '../queues/queues.module';

const jwtSecret: string = config.JWT_SECRET;
const jwtAccessExpiresIn: StringValue = config.JWT_ACCESS_EXPIRES_IN;

@Module({
  imports: [
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: jwtAccessExpiresIn },
    }),
    QueuesModule,
  ],
  providers: [AuthService, PrismaService, JwtStrategy, RolesGuard],
  controllers: [AuthController],
})
export class AuthModule {}
