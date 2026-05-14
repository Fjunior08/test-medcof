import type { Request, Response } from 'express';
import type { HealthCheckUseCase } from '@application/use-cases/health-check.use-case.js';
import { ApiResponse } from '@shared/http/api-response.js';
import { buildErrorBody } from '@shared/http/api-response.builders.js';

export class HealthController {
  constructor(private readonly healthCheckUseCase: HealthCheckUseCase) {}

  /** Liveness: processo vivo (sem I/O externo) — adequado a probes frequentes. */
  handleLiveness = async (_req: Request, res: Response): Promise<void> => {
    const result = await this.healthCheckUseCase.executeLiveness();
    ApiResponse.success(res, 200, result);
  };

  /** Readiness: dependências críticas (ex.: DB) — orquestradores podem remover tráfego se 503. */
  handleReadiness = async (_req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.healthCheckUseCase.executeReadiness();
      ApiResponse.success(res, 200, result);
    } catch {
      res.status(503).json(buildErrorBody('SERVICE_UNAVAILABLE', 'Service is not ready'));
    }
  };
}
