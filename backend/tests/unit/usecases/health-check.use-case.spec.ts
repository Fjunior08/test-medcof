import { describe, expect, it, jest } from '@jest/globals';
import { HealthCheckUseCase } from '@application/use-cases/health-check.use-case.js';
import type { DatabaseHealthPort } from '@application/ports/database-health.port.js';

describe('HealthCheckUseCase', () => {
  it('liveness returns ok without touching database', async () => {
    const ping = jest.fn(async (): Promise<void> => {
      await Promise.resolve();
    });
    const db: DatabaseHealthPort = { ping };
    const useCase = new HealthCheckUseCase(db);

    const result = await useCase.executeLiveness();

    expect(result).toStrictEqual({ status: 'ok' });
    expect(ping).not.toHaveBeenCalled();
  });

  it('readiness delegates to database ping', async () => {
    const ping = jest.fn(async (): Promise<void> => {
      await Promise.resolve();
    });
    const db: DatabaseHealthPort = { ping };
    const useCase = new HealthCheckUseCase(db);

    const result = await useCase.executeReadiness();

    expect(result).toStrictEqual({ status: 'ok', checks: { database: 'up' } });
    expect(ping).toHaveBeenCalledTimes(1);
  });

  it('readiness propagates ping failures', async () => {
    const ping = jest.fn(async () => {
      throw new Error('db down');
    });
    const useCase = new HealthCheckUseCase({ ping });

    await expect(useCase.executeReadiness()).rejects.toThrow('db down');
  });
});
