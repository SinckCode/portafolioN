import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse = {
      statusCode: status,
      message:
        typeof exceptionResponse === 'object' && 'message' in exceptionResponse
          ? (exceptionResponse as Record<string, unknown>).message
          : exception.message,
      error:
        typeof exceptionResponse === 'object' && 'error' in exceptionResponse
          ? (exceptionResponse as Record<string, unknown>).error
          : 'Error',
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.error(`${request.method} ${request.url} ${status} - ${exception.message}`);

    response.status(status).json(errorResponse);
  }
}
