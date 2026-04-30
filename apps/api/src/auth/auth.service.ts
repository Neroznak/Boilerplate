import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '@repo/database';
import * as argon2 from 'argon2';
import { RegisterDto } from './dto/auth.dto';
import { UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { EmailQueue } from '../queues/email.queue';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailQueue: EmailQueue,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    await this.emailQueue.sendEmail({
      userId: user.id,
      email: user.email,
      type: 'welcome',
    });

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = randomBytes(64).toString('hex');
    const refreshHash = await argon2.hash(refreshToken);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await argon2.verify(user.passwordHash, dto.password);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = randomBytes(64).toString('hex');
    const refreshHash = await argon2.hash(refreshToken);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }
    const sessions = await this.prisma.session.findMany({
      where: {
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    const session = await Promise.any(
      sessions.map(async (session) => {
        const isValid = await argon2.verify(session.refreshHash, refreshToken);
        if (!isValid) {
          throw new Error('Invalid refresh token');
        }

        return session;
      }),
    ).catch(() => null);

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: session.user.id,
      email: session.user.email,
      role: session.user.role,
    });

    const newRefreshToken = randomBytes(64).toString('hex');
    const newRefreshHash = await argon2.hash(newRefreshToken);

    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshHash: newRefreshHash,
      },
    });

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
      },
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    const sessions = await this.prisma.session.findMany({
      where: {
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    const session = await Promise.any(
      sessions.map(async (session) => {
        const isValid = await argon2.verify(session.refreshHash, refreshToken);
        if (!isValid) {
          throw new Error('Invalid refresh token');
        }

        return session;
      }),
    ).catch(() => null);

    if (!session) {
      return { success: true };
    }

    await this.prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    return { success: true };
  }
}
