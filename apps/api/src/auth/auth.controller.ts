import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtGuard } from './guards/jwt.guard';
import type { Request } from 'express';
import { RolesGuard } from './guards/roles.guard';
import { UserRole } from '@repo/database';
import { Roles } from './decorators/roles.decorator';
import type { Response } from 'express';
import { refreshTokenCookieOptions } from './auth.cookies';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
    email: string;
    role: string;
  };
};

type RequestWithRefreshCookie = Request & {
  cookies?: {
    refreshToken?: string;
  };
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);

    if (result.refreshToken) {
      res.cookie(
        'refreshToken',
        result.refreshToken,
        refreshTokenCookieOptions,
      );
    }

    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);

    if (result.refreshToken) {
      res.cookie(
        'refreshToken',
        result.refreshToken,
        refreshTokenCookieOptions,
      );
    }

    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Post('refresh')
  async refresh(
    @Req() req: RequestWithRefreshCookie,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }
    const result = await this.authService.refresh(refreshToken);

    if (result.refreshToken) {
      res.cookie(
        'refreshToken',
        result.refreshToken,
        refreshTokenCookieOptions,
      );
    }

    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Post('logout')
  async logout(
    @Req() req: RequestWithRefreshCookie,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }
    await this.authService.logout(refreshToken);

    res.clearCookie('refreshToken', refreshTokenCookieOptions);

    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtGuard)
  me(@Req() req: AuthenticatedRequest) {
    return {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
    };
  }

  @Get('admin')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  admin() {
    if (process.env.NODE_ENV !== 'development') {
      return { message: 'Not available' };
    }

    return { message: 'Admin access granted' };
  }
}
