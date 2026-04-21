import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { Prisma } from '@prisma/client';
import { AppLoggerService } from '../logging/app-logger.service';
import { MetricsService } from '../metrics/metrics.service';
import { PrismaService } from '../prisma/prisma.service';
import { scenarioStatuses } from './scenario.constants';
import { RunScenarioDto } from './dto/run-scenario.dto';

@Injectable()
export class ScenariosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metrics: MetricsService,
    private readonly logger: AppLoggerService,
  ) {}

  async listLatestRuns() {
    return this.prisma.scenarioRun.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async runScenario(input: RunScenarioDto) {
    const startedAt = Date.now();

    switch (input.type) {
      case 'success':
        return this.completeScenario(input, startedAt);
      case 'slow_request':
        await this.sleep(this.randomDuration(2000, 5000));
        return this.completeScenario(input, startedAt, {
          slowRequest: true,
        });
      case 'validation_error':
        return this.failValidation(input, startedAt);
      case 'system_error':
        return this.failSystem(input, startedAt);
      case 'teapot':
        return this.returnTeapot(input, startedAt);
      default:
        throw new BadRequestException('Unsupported scenario type');
    }
  }

  private async completeScenario(
    input: RunScenarioDto,
    startedAt: number,
    metadata?: Prisma.JsonObject,
  ) {
    const duration = Date.now() - startedAt;
    const run = await this.prisma.scenarioRun.create({
      data: {
        type: input.type,
        name: input.name,
        status: scenarioStatuses.completed,
        duration,
        metadata,
      },
    });

    this.metrics.recordScenarioRun(
      input.type,
      scenarioStatuses.completed,
      duration,
    );
    this.logger.scenario(
      input.type === 'slow_request' ? 'warn' : 'info',
      'Scenario completed',
      {
        context: 'ScenariosService',
        scenarioId: run.id,
        scenarioType: input.type,
        duration,
        status: scenarioStatuses.completed,
      },
    );

    return {
      id: run.id,
      status: scenarioStatuses.completed,
      duration,
      signal: metadata?.signal,
      message:
        input.type === 'slow_request'
          ? 'Slow scenario completed'
          : 'Scenario completed',
    };
  }

  private async failValidation(
    input: RunScenarioDto,
    startedAt: number,
  ): Promise<never> {
    const duration = Date.now() - startedAt;
    const run = await this.prisma.scenarioRun.create({
      data: {
        type: input.type,
        name: input.name,
        status: scenarioStatuses.failed,
        duration,
        error: 'Validation failed for provided input',
      },
    });

    this.metrics.recordScenarioRun(
      input.type,
      scenarioStatuses.failed,
      duration,
    );
    Sentry.addBreadcrumb({
      category: 'scenario',
      level: 'warning',
      message: 'Validation scenario triggered',
      data: {
        scenarioId: run.id,
        scenarioType: input.type,
      },
    });

    this.logger.scenario('warn', 'Scenario validation failed', {
      context: 'ScenariosService',
      scenarioId: run.id,
      scenarioType: input.type,
      duration,
      error: 'Validation failed for provided input',
      status: scenarioStatuses.failed,
    });

    throw new BadRequestException('Validation failed for provided input');
  }

  private async failSystem(
    input: RunScenarioDto,
    startedAt: number,
  ): Promise<never> {
    const duration = Date.now() - startedAt;
    const run = await this.prisma.scenarioRun.create({
      data: {
        type: input.type,
        name: input.name,
        status: scenarioStatuses.failed,
        duration,
        error: 'Synthetic system error triggered',
      },
    });

    this.metrics.recordScenarioRun(
      input.type,
      scenarioStatuses.failed,
      duration,
    );

    const exception = new InternalServerErrorException(
      'Synthetic system error triggered',
    );
    Sentry.captureException(exception, {
      extra: {
        scenarioId: run.id,
        scenarioType: input.type,
        duration,
      },
    });

    this.logger.scenario('error', 'Scenario system error triggered', {
      context: 'ScenariosService',
      scenarioId: run.id,
      scenarioType: input.type,
      duration,
      error: 'Synthetic system error triggered',
      status: scenarioStatuses.failed,
    });

    throw exception;
  }

  private async returnTeapot(
    input: RunScenarioDto,
    startedAt: number,
  ): Promise<never> {
    const duration = Date.now() - startedAt;
    const run = await this.prisma.scenarioRun.create({
      data: {
        type: input.type,
        name: input.name,
        status: scenarioStatuses.completed,
        duration,
        metadata: {
          easter: true,
          signal: 42,
        },
      },
    });

    this.metrics.recordScenarioRun(
      input.type,
      scenarioStatuses.completed,
      duration,
    );
    this.logger.scenario('info', 'Scenario teapot triggered', {
      context: 'ScenariosService',
      scenarioId: run.id,
      scenarioType: input.type,
      duration,
      status: scenarioStatuses.completed,
      signal: 42,
    });

    throw new HttpException(
      {
        signal: 42,
        message: "I'm a teapot",
        id: run.id,
        duration,
      },
      HttpStatus.I_AM_A_TEAPOT,
    );
  }

  private sleep(durationMs: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, durationMs));
  }

  private randomDuration(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
