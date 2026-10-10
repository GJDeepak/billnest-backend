import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface ErrorDetails {
  code?: string;
  constraint?: string;
  message?: string;
  cause?: unknown;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    // 1. Handle known NestJS HTTP exceptions
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();

      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const body = exceptionResponse as {
          message?: string | string[];
        };

        if (Array.isArray(body.message)) {
          message = body.message.join(', ');
        } else if (body.message) {
          message = body.message;
        }
      }
    } else {
      // 2. Handle PostgreSQL / Drizzle errors
      const error = exception as ErrorDetails;
      const cause = error?.cause as ErrorDetails | undefined;
      const code = error?.code ?? cause?.code;

      switch (code) {
        // PostgreSQL: unique constraint violation
        case '23505':
          statusCode = HttpStatus.CONFLICT;
          message = 'Record already exists';
          break;

        // PostgreSQL: foreign key violation
        case '23503':
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'Referenced record does not exist';
          break;

        // PostgreSQL: not-null violation
        case '23502':
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'A required field is missing';
          break;

        // PostgreSQL: check constraint violation
        case '23514':
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'The provided data violates a constraint';
          break;

        // PostgreSQL: invalid text representation
        case '22P02':
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'Invalid data format';
          break;

        // PostgreSQL: numeric value out of range
        case '22003':
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'Numeric value is out of range';
          break;

        // PostgreSQL: serialization failure / deadlock
        case '40001':
        case '40P01':
          statusCode = HttpStatus.SERVICE_UNAVAILABLE;
          message = 'Transaction failed. Please try again';
          break;

        default:
          // 3. Unexpected errors: log details privately
          this.logger.error(
            exception instanceof Error
              ? exception.message
              : String(exception),
            exception instanceof Error
              ? exception.stack
              : undefined,
          );
          break;
      }

      // 4. Detect common database connection failures
      if (
        code === 'ECONNREFUSED' ||
        code === 'ECONNRESET' ||
        code === '57P01'
      ) {
        statusCode = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'Database service is temporarily unavailable';
      }
    }

    // 5. Return a consistent API response
    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    });
  }
}