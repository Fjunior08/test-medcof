import { Router } from 'express';
import type { RequestHandler } from 'express';
import type { AuthController } from '../controllers/auth.controller.js';
import { ApiResponse } from '@shared/http/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';
import { requireAuthUser } from '../utils/require-auth-user.js';

export interface AuthRoutesDeps {
  readonly authController: AuthController;
  readonly authenticateMiddleware: RequestHandler;
  readonly loginRateLimiter: RequestHandler;
}

export function createAuthRouter(deps: AuthRoutesDeps): Router {
  const router = Router();

  router.post('/register', asyncHandler((req, res) => deps.authController.register(req, res)));
  router.post(
    '/login',
    deps.loginRateLimiter,
    asyncHandler((req, res) => deps.authController.login(req, res)),
  );

  router.get('/me', deps.authenticateMiddleware, asyncHandler((req, res) => {
    const user = requireAuthUser(req);
    ApiResponse.success(res, 200, { user });
  }));

  return router;
}
