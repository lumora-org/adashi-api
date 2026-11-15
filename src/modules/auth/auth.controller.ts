import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const REFRESH_COOKIE = 'adashi_refresh';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.authService.register(dto);
    this.setRefreshCookie(res, tokens.refreshToken);
    return {
      message: 'Registration successful',
      data: {
        user: this.usersService.toProfileDto(user),
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
      },
    };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.authService.login(dto);
    this.setRefreshCookie(res, tokens.refreshToken);
    return {
      message: 'Login successful',
      data: {
        user: this.usersService.toProfileDto(user),
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
      },
    };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const raw = (req.cookies as Record<string, string> | undefined)?.[
      REFRESH_COOKIE
    ];
    const tokens = await this.authService.refresh(raw ?? '');
    this.setRefreshCookie(res, tokens.refreshToken);
    return {
      message: 'Session refreshed',
      data: {
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
      },
    };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const raw = (req.cookies as Record<string, string> | undefined)?.[
      REFRESH_COOKIE
    ];
    await this.authService.logout(raw);
    res.clearCookie(REFRESH_COOKIE, { httpOnly: true, sameSite: 'lax' });
    return { message: 'Logged out successfully', data: null };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('verify')
  async verify(@Body() body: { email?: string; code?: string }) {
    if (!body.email || !body.code) {
      return {
        message: 'email and code are required',
        data: null,
      };
    }
    const user = await this.authService.verifyEmail(body.email, body.code);
    return {
      message: 'Email verified successfully',
      data: this.usersService.toProfileDto(user),
    };
  }

  @ApiBearerAuth()
  @Get('session')
  async session(@CurrentUser() user: AuthUser) {
    const profile = await this.usersService.getProfile(user.userId);
    return {
      message: 'Session valid',
      data: this.usersService.toProfileDto(profile),
    };
  }

  private setRefreshCookie(res: Response, token: string): void {
    res.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/v1/auth',
    });
  }
}
