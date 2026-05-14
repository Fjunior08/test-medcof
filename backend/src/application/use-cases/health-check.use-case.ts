import type { DatabaseHealthPort } from '@application/ports/database-health.port.js';

export interface LivenessResult {
  readonly status: 'ok';
}

export interface ReadinessResult {
  readonly status: 'ok';
  readonly checks: {
    readonly database: 'up';
  };
}

export class HealthCheckUseCase {
  constructor(private readonly databaseHealth: DatabaseHealthPort) {}

  executeLiveness(): Promise<LivenessResult> {
    return Promise.resolve({ status: 'ok' });
  }

  async executeReadiness(): Promise<ReadinessResult> {
    await this.databaseHealth.ping();
    return { status: 'ok', checks: { database: 'up' } };
  }
}
