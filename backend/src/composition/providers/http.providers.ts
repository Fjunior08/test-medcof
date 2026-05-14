import type { AppContainer } from '../app-container.js';
import { appConfig, buildSecurityHttpConfig } from '@shared/config/index.js';
import { AuthController } from '@infrastructure/http/controllers/auth.controller.js';
import { HealthController } from '@infrastructure/http/controllers/health.controller.js';
import { TasksController } from '@infrastructure/http/controllers/tasks.controller.js';
import { createHttpApp } from '@infrastructure/http/app.js';

/**
 * Camada HTTP: controllers recebem apenas use cases (interfaces / classes de aplicação).
 */
export function registerHttpProviders(container: AppContainer): void {
  container.registerSingleton(
    'healthController',
    (c) => new HealthController(c.resolve('healthCheckUseCase')),
  );

  container.registerSingleton(
    'authController',
    (c) => new AuthController(c.resolve('registerUserUseCase'), c.resolve('loginUserUseCase')),
  );

  container.registerSingleton(
    'tasksController',
    (c) =>
      new TasksController(
        c.resolve('createTaskUseCase'),
        c.resolve('bulkCreateTasksUseCase'),
        c.resolve('listTasksUseCase'),
        c.resolve('getTaskByIdUseCase'),
        c.resolve('updateTaskUseCase'),
        c.resolve('deleteTaskUseCase'),
      ),
  );

  container.registerSingleton('httpApp', (c) =>
    createHttpApp({
      appLogger: c.resolve('appLogger'),
      healthController: c.resolve('healthController'),
      authController: c.resolve('authController'),
      tasksController: c.resolve('tasksController'),
      authenticateMiddleware: c.resolve('authenticateMiddleware'),
      security: buildSecurityHttpConfig(appConfig),
    }),
  );
}
