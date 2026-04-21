import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as Sentry from '@sentry/node';
import { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AppLoggerService } from './logging/app-logger.service';
import { MetricsService } from './metrics/metrics.service';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const logger = app.get(AppLoggerService);
  const metrics = app.get(MetricsService);
  const prisma = app.get(PrismaService);
  const sentryDsn = process.env.SENTRY_DSN;

  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      environment: process.env.SENTRY_ENVIRONMENT ?? 'development',
      tracesSampleRate: 1,
    });
  }

  app.useLogger(logger);
  app.enableCors();
  app.setGlobalPrefix('api', {
    exclude: [{ path: 'metrics', method: RequestMethod.GET }],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter(logger));

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.on('finish', () => {
      metrics.recordHttpRequest(
        req.method,
        req.originalUrl.split('?')[0],
        res.statusCode,
      );
    });

    next();
  });

  const config = new DocumentBuilder()
    .setTitle('Signal Lab API')
    .setDescription('Scenario runner API for observability demo')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  prisma.enableShutdownHooks(app);

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port, '0.0.0.0');
  logger.log(`Backend listening on port ${port}`, {
    context: 'bootstrap',
    port,
  });
}
void bootstrap();
