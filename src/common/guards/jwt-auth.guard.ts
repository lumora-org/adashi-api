import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthUser } from '../decorators/current-user.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException({
        message: 'Authentication required',
        error: 'UNAUTHENTICATED',
      });
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      const user: AuthUser = {
        userId: payload.sub,
        email: payload.email,
        platformRole: payload.platformRole,
      };
      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException({
        message: 'Invalid or expired access token',
        error: 'UNAUTHENTICATED',
      });
    }
  }

  private extractToken(request: {
    headers: Record<string, string | undefined>;
  }): string | undefined {
    const [type, token] = (request.headers.authorization ?? '').split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
