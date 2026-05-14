import type { RequestHandler } from 'express';
import express from 'express';
import type { LoggerPort } from '@shared/logging/logger.port.js';
import type { SecurityHttpConfig } from '@shared/config/security-http.config.js';
import type { AuthController } from './controllers/auth.controller.js';
import type { HealthController } from './controllers/health.controller.js';
import type { TasksController } from './controllers/tasks.controller.js';
import { createCorsMiddleware } from './middlewares/cors.middleware.js';
import { createGlobalErrorHandler } from './middlewares/global-error-handler.middleware.js';
import { createGlobalRateLimiter, createLoginRateLimiter } from './middlewares/rate-limit.middleware.js';
import { requestContextMiddleware } from './middlewares/request-context.middleware.js';
import { createRequestLoggingMiddleware } from './middlewares/request-logging.middleware.js';
import { createSanitizeRequestBodyMiddleware } from './middlewares/sanitize-request.middleware.js';
import { createSecurityHeadersMiddleware } from './middlewares/security-headers.middleware.js';
import { createHealthRouter } from './routes/health.routes.js';
import { createAuthRouter } from './routes/auth.routes.js';
import { createTasksRouter } from './routes/tasks.routes.js';

export interface HttpAppDependencies {
  readonly appLogger: LoggerPort;
  readonly healthController: HealthController;
  readonly authController: AuthController;
  readonly tasksController: TasksController;
  readonly authenticateMiddleware: RequestHandler;
  readonly security: SecurityHttpConfig;
}

export function createHttpApp(deps: HttpAppDependencies): express.Express {
  const app = express();
  app.set('trust proxy', deps.security.trustProxy);
  app.disable('x-powered-by');

  app.use(createSecurityHeadersMiddleware(deps.security.helmet));
  app.use(createCorsMiddleware(deps.security.cors));
  app.use(createGlobalRateLimiter(deps.security.globalRateLimit));

  app.use(requestContextMiddleware);
  app.use(express.json({ limit: deps.security.jsonBodyLimit }));
  app.use(createSanitizeRequestBodyMiddleware());
  app.use(createRequestLoggingMiddleware({ logger: deps.appLogger }));

  const loginRateLimiter = createLoginRateLimiter(deps.security.loginRateLimit);

  app.use('/health', createHealthRouter({ healthController: deps.healthController }));
  app.use(
    '/auth',
    createAuthRouter({
      authController: deps.authController,
      authenticateMiddleware: deps.authenticateMiddleware,
      loginRateLimiter,
    }),
  );
  app.use(
    '/tasks',
    createTasksRouter({
      tasksController: deps.tasksController,
      authenticateMiddleware: deps.authenticateMiddleware,
    }),
  );
  app.use(createGlobalErrorHandler(deps.appLogger));
  return app;
}
