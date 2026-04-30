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


@Module({
  imports: [
    JwtModule.register({
      secret: config.JWT_SECRET,
      signOptions: { expiresIn: config.JWT_ACCESS_EXPIRES_IN as StringValue },
    }),
    QueuesModule,
  ],
  providers: [AuthService, PrismaService, JwtStrategy, RolesGuard],
  controllers: [AuthController]
})
export class AuthModule {}
