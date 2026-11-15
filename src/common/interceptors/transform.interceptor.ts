import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  meta?: Record<string, unknown>;
}

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<unknown>> {
    const request = context.switchToHttp().getRequest();
    const message =
      (request.res?.locals?.message as string | undefined) ??
      'Request completed successfully';

    return next.handle().pipe(
      map((body) => {
        if (body !== null && typeof body === 'object' && 'data' in body) {
          const envelope = body as ApiResponse<unknown>;
          return {
            success: envelope.success ?? true,
            message: envelope.message ?? message,
            data: envelope.data ?? null,
            ...(envelope.meta ? { meta: envelope.meta } : {}),
          };
        }
        return {
          success: true,
          message,
          data: body ?? null,
          meta: { timestamp: new Date().toISOString() },
        };
      }),
    );
  }
}
