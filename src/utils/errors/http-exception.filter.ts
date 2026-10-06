import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter
  implements ExceptionFilter
{
  private readonly logger = new Logger(
    HttpExceptionFilter.name,
  );

  catch(
    exception: unknown,
    host: ArgumentsHost,
  ) {
    const context = host.switchToHttp();

    const response = context.getResponse<Response>();

    const request = context.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();

      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const errorResponse = exceptionResponse as { message?: string | string[]; };

        if (Array.isArray(errorResponse.message)) {
          message = errorResponse.message.join(', ');
        } else if (errorResponse.message) {
          message = errorResponse.message;
        }
      }
    } else {
      this.logger.error(
        exception instanceof Error ? exception.stack: exception,
      );
    }

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