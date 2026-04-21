import { Injectable, LoggerService } from '@nestjs/common';
import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

@Injectable()
export class AppLoggerService implements LoggerService {
  private write(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
  ): void {
    const payload = {
      app: 'signal-lab',
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context ?? {}),
    };

    const line = JSON.stringify(payload);
    const logFilePath = process.env.LOG_FILE_PATH;

    if (logFilePath) {
      mkdirSync(dirname(logFilePath), { recursive: true });
      appendFileSync(logFilePath, `${line}\n`);
    }

    if (level === 'error') {
      process.stderr.write(`${line}\n`);
      return;
    }

    process.stdout.write(`${line}\n`);
  }

  log(message: string, context?: string | Record<string, unknown>): void {
    this.write('info', message, this.normalizeContext(context));
  }

  error(
    message: string,
    trace?: string,
    context?: string | Record<string, unknown>,
  ): void {
    this.write('error', message, {
      trace,
      ...this.normalizeContext(context),
    });
  }

  warn(message: string, context?: string | Record<string, unknown>): void {
    this.write('warn', message, this.normalizeContext(context));
  }

  debug(message: string, context?: string | Record<string, unknown>): void {
    this.write('debug', message, this.normalizeContext(context));
  }

  verbose(message: string, context?: string | Record<string, unknown>): void {
    this.write('debug', message, this.normalizeContext(context));
  }

  scenario(
    level: Exclude<LogLevel, 'debug'>,
    message: string,
    context: Record<string, unknown>,
  ): void {
    this.write(level, message, context);
  }

  private normalizeContext(
    context?: string | Record<string, unknown>,
  ): Record<string, unknown> | undefined {
    if (!context) {
      return undefined;
    }

    if (typeof context === 'string') {
      return { context };
    }

    return context;
  }
}
