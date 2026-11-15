import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'crypto';
import { IsNull, Repository } from 'typeorm';
import {
  AccountStatus,
  PlatformRole,
  VerificationStatus,
} from '../users/enums/user.enums';
import { RefreshToken } from '../users/entities/refresh-token.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokensRepository: Repository<RefreshToken>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(
    dto: RegisterDto,
  ): Promise<{ user: User; tokens: AuthTokens }> {
    const existing = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException({
        message: 'An account with this email already exists',
        error: 'DUPLICATE_EMAIL',
      });
    }

    const requireVerification = this.config.get<boolean>(
      'auth.requireVerification',
      false,
    );
    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });

    const user = this.usersRepository.create({
      fullName: dto.fullName,
      email: dto.email,
      phoneNumber: dto.phoneNumber ?? null,
      passwordHash,
      accountStatus: AccountStatus.ACTIVE,
      verificationStatus: requireVerification
        ? VerificationStatus.UNVERIFIED
        : VerificationStatus.VERIFIED,
      platformRole: PlatformRole.USER,
      emailVerificationCode: requireVerification
        ? randomBytes(3).toString('hex').toUpperCase()
        : null,
      emailVerificationExpiresAt: requireVerification
        ? new Date(Date.now() + 15 * 60 * 1000)
        : null,
    });

    const saved = await this.usersRepository.save(user);
    if (requireVerification && saved.emailVerificationCode) {
      this.logger.log(
        `Verification code for ${saved.email}: ${saved.emailVerificationCode}`,
      );
    }
    const tokens = await this.issueTokens(saved);
    return { user: saved, tokens };
  }

  async login(
    dto: LoginDto,
  ): Promise<{ user: User; tokens: AuthTokens }> {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    const invalid = new UnauthorizedException({
      message: 'Invalid email or password',
      error: 'INVALID_CREDENTIALS',
    });
    if (!user) {
      throw invalid;
    }

    const passwordOk = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordOk) {
      throw invalid;
    }

    if (user.accountStatus === AccountStatus.SUSPENDED) {
      throw new ForbiddenException({
        message: 'Account is suspended',
        error: 'ACCOUNT_SUSPENDED',
      });
    }
    if (user.accountStatus === AccountStatus.CLOSED) {
      throw new ForbiddenException({
        message: 'Account is closed',
        error: 'ACCOUNT_CLOSED',
      });
    }
    if (
      this.config.get<boolean>('auth.requireVerification', false) &&
      user.verificationStatus === VerificationStatus.UNVERIFIED
    ) {
      throw new ForbiddenException({
        message: 'Account is not verified',
        error: 'ACCOUNT_NOT_VERIFIED',
      });
    }

    user.lastLoginAt = new Date();
    await this.usersRepository.save(user);

    const tokens = await this.issueTokens(user);
    return { user, tokens };
  }

  async refresh(rawToken: string): Promise<AuthTokens> {
    const tokenHash = this.hashToken(rawToken);
    const stored = await this.refreshTokensRepository.findOne({
      where: { tokenHash },
    });

    const invalid = new UnauthorizedException({
      message: 'Invalid refresh session',
      error: 'INVALID_REFRESH_TOKEN',
    });

    if (!stored || stored.revokedAt) {
      // Refresh token reuse detection: revoke all sessions for the user
      if (stored?.revokedAt) {
        await this.revokeAllForUser(stored.userId);
        this.logger.warn(
          `Refresh token reuse detected for user ${stored.userId}; all sessions revoked`,
        );
      }
      throw invalid;
    }
    if (stored.expiresAt.getTime() <= Date.now()) {
      throw invalid;
    }

    const user = await this.usersRepository.findOne({
      where: { id: stored.userId },
    });
    if (!user || user.accountStatus !== AccountStatus.ACTIVE) {
      throw invalid;
    }

    const tokens = await this.issueTokens(user, stored);
    return tokens;
  }

  async logout(rawToken: string | undefined): Promise<void> {
    if (!rawToken) return;
    const tokenHash = this.hashToken(rawToken);
    const stored = await this.refreshTokensRepository.findOne({
      where: { tokenHash },
    });
    if (stored && !stored.revokedAt) {
      stored.revokedAt = new Date();
      await this.refreshTokensRepository.save(stored);
    }
  }

  async verifyEmail(email: string, code: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (
      !user ||
      !user.emailVerificationCode ||
      !user.emailVerificationExpiresAt ||
      user.emailVerificationExpiresAt.getTime() < Date.now()
    ) {
      throw new UnauthorizedException({
        message: 'Invalid or expired verification code',
        error: 'INVALID_VERIFICATION_CODE',
      });
    }
    if (user.emailVerificationCode !== code.toUpperCase()) {
      throw new UnauthorizedException({
        message: 'Invalid or expired verification code',
        error: 'INVALID_VERIFICATION_CODE',
      });
    }
    user.verificationStatus = VerificationStatus.VERIFIED;
    user.emailVerificationCode = null;
    user.emailVerificationExpiresAt = null;
    return this.usersRepository.save(user);
  }

  private async issueTokens(
    user: User,
    previous?: RefreshToken,
  ): Promise<AuthTokens> {
    const accessSecret = this.config.get<string>('jwt.accessSecret');
    const accessExpiresIn = this.config.get<string>(
      'jwt.accessExpiresIn',
      '15m',
    );
    const refreshExpiresIn = this.config.get<string>(
      'jwt.refreshExpiresIn',
      '7d',
    );

    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        platformRole: user.platformRole,
      },
      {
        secret: accessSecret,
        expiresIn: accessExpiresIn as JwtSignOptions['expiresIn'],
      },
    );

    const rawRefresh = randomBytes(48).toString('base64url');
    const refreshTokenRow = this.refreshTokensRepository.create({
      userId: user.id,
      tokenHash: this.hashToken(rawRefresh),
      expiresAt: this.expiryFrom(refreshExpiresIn),
    });
    const saved = await this.refreshTokensRepository.save(refreshTokenRow);

    if (previous) {
      previous.revokedAt = new Date();
      previous.replacedBy = saved.id;
      await this.refreshTokensRepository.save(previous);
    }

    const expiresInMs = this.expiryFrom(accessExpiresIn).getTime() - Date.now();
    return {
      accessToken,
      expiresIn: Math.max(Math.floor(expiresInMs / 1000), 0),
      refreshToken: rawRefresh,
    };
  }

  private async revokeAllForUser(userId: string): Promise<void> {
    await this.refreshTokensRepository.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  private hashToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }

  private expiryFrom(relative: string): Date {
    const match = /^(\d+)([smhd])$/.exec(relative.trim());
    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const factor =
      unit === 's'
        ? 1000
        : unit === 'm'
          ? 60 * 1000
          : unit === 'h'
            ? 60 * 60 * 1000
            : 24 * 60 * 60 * 1000;
    return new Date(Date.now() + value * factor);
  }
}
