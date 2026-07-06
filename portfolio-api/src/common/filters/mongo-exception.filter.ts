import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';

@Catch()
export class MongoExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('MongoExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // MongoDB duplicate key error
    if (
      exception &&
      typeof exception === 'object' &&
      'code' in exception &&
      (exception as Record<string, unknown>).code === 11000
    ) {
      const keyValue = (exception as Record<string, unknown>).keyValue as Record<string, unknown>;
      const field = keyValue ? Object.keys(keyValue)[0] : 'field';
      response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: `Duplicate value for ${field}. This ${field} already exists.`,
        error: 'Conflict',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    }

    // Mongoose validation error
    if (exception instanceof MongooseError.ValidationError) {
      const messages = Object.values(exception.errors).map((err) => err.message);
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: messages,
        error: 'Validation Error',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    }

    // Mongoose cast error (invalid ObjectId etc)
    if (exception instanceof MongooseError.CastError) {
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Invalid ${exception.path}: ${exception.value}`,
        error: 'Bad Request',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    }

    // Let other exceptions pass through
    if (exception && typeof exception === 'object' && 'getStatus' in exception) {
      return;
    }

    this.logger.error('Unhandled exception', exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
