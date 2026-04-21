import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { Request, Response } from 'express';
import { AppLoggerService } from '../../logging/app-logger.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = isHttpException ? exception.getResponse() : null;

    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'message' in payload &&
      typeof payload.message === 'string'
        ? payload.message
        : exception instanceof Error
          ? exception.message
          : 'Unexpected error';

    if (status >= 500) {
      Sentry.captureException(exception);
      this.logger.error(
        message,
        exception instanceof Error ? exception.stack : undefined,
        {
          context: 'HttpExceptionFilter',
          method: request.method,
          path: request.url,
          statusCode: status,
        },
      );
    } else {
      this.logger.warn(message, {
        context: 'HttpExceptionFilter',
        method: request.method,
        path: request.url,
        statusCode: status,
      });
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
