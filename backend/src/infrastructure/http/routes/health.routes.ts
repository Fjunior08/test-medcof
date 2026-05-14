import { Router } from 'express';
import type { HealthController } from '../controllers/health.controller.js';
import { asyncHandler } from '../utils/async-handler.js';

export interface HealthRoutesDeps {
  readonly healthController: HealthController;
}

export function createHealthRouter(deps: HealthRoutesDeps): Router {
  const router = Router();
  router.get('/', asyncHandler((req, res) => deps.healthController.handleLiveness(req, res)));
  router.get('/ready', asyncHandler((req, res) => deps.healthController.handleReadiness(req, res)));
  return router;
}
