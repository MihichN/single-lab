import { Injectable } from '@nestjs/common';
import {
  collectDefaultMetrics,
  Counter,
  Histogram,
  Registry,
} from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry = new Registry();

  readonly scenarioRunsTotal = new Counter({
    name: 'scenario_runs_total',
    help: 'Total number of scenario runs',
    labelNames: ['type', 'status'] as const,
    registers: [this.registry],
  });

  readonly scenarioRunDurationSeconds = new Histogram({
    name: 'scenario_run_duration_seconds',
    help: 'Scenario run duration in seconds',
    labelNames: ['type'] as const,
    buckets: [0.1, 0.5, 1, 2, 3, 5, 8, 13],
    registers: [this.registry],
  });

  readonly httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'HTTP requests grouped by method, path and status code',
    labelNames: ['method', 'path', 'status_code'] as const,
    registers: [this.registry],
  });

  constructor() {
    collectDefaultMetrics({ register: this.registry, prefix: 'signal_lab_' });
  }

  recordScenarioRun(type: string, status: string, durationMs?: number): void {
    this.scenarioRunsTotal.inc({ type, status });

    if (typeof durationMs === 'number') {
      this.scenarioRunDurationSeconds.observe({ type }, durationMs / 1000);
    }
  }

  recordHttpRequest(
    method: string,
    path: string,
    statusCode: number | string,
  ): void {
    this.httpRequestsTotal.inc({
      method,
      path,
      status_code: String(statusCode),
    });
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getContentType(): string {
    return this.registry.contentType;
  }
}
