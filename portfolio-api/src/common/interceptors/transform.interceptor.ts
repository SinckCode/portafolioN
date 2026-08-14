import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // Skip wrapping if the response already has a data envelope (paginated responses)
        if (data !== null && typeof data === 'object' && !Array.isArray(data) && 'data' in data) {
          return data;
        }
        return { data };
      }),
    );
  }
}
