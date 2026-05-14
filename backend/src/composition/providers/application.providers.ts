import type { AppContainer } from '../app-container.js';
import { RegisterUserUseCase } from '@application/use-cases/register-user.use-case.js';
import { LoginUserUseCase } from '@application/use-cases/login-user.use-case.js';
import { CreateTaskUseCase } from '@application/use-cases/create-task.use-case.js';
import { BulkCreateTasksUseCase } from '@application/use-cases/bulk-create-tasks.use-case.js';
import { ListTasksUseCase } from '@application/use-cases/list-tasks.use-case.js';
import { GetTaskByIdUseCase } from '@application/use-cases/get-task-by-id.use-case.js';
import { UpdateTaskUseCase } from '@application/use-cases/update-task.use-case.js';
import { DeleteTaskUseCase } from '@application/use-cases/delete-task.use-case.js';
import { HealthCheckUseCase } from '@application/use-cases/health-check.use-case.js';

/**
 * Casos de uso: dependem apenas de portas resolvidas no container.
 */
export function registerApplicationProviders(container: AppContainer): void {
  container.registerSingleton(
    'healthCheckUseCase',
    (c) => new HealthCheckUseCase(c.resolve('databaseHealth')),
  );

  container.registerSingleton(
    'registerUserUseCase',
    (c) => new RegisterUserUseCase(c.resolve('userRepository'), c.resolve('passwordHasher')),
  );

  container.registerSingleton(
    'loginUserUseCase',
    (c) =>
      new LoginUserUseCase(
        c.resolve('userRepository'),
        c.resolve('passwordHasher'),
        c.resolve('jwtTokenService'),
      ),
  );

  container.registerSingleton('createTaskUseCase', (c) => new CreateTaskUseCase(c.resolve('taskRepository')));

  container.registerSingleton(
    'bulkCreateTasksUseCase',
    (c) => new BulkCreateTasksUseCase(c.resolve('taskRepository')),
  );

  container.registerSingleton('listTasksUseCase', (c) => new ListTasksUseCase(c.resolve('taskRepository')));

  container.registerSingleton(
    'getTaskByIdUseCase',
    (c) => new GetTaskByIdUseCase(c.resolve('taskRepository')),
  );

  container.registerSingleton('updateTaskUseCase', (c) => new UpdateTaskUseCase(c.resolve('taskRepository')));

  container.registerSingleton('deleteTaskUseCase', (c) => new DeleteTaskUseCase(c.resolve('taskRepository')));
}
