import type { LoggerPort } from '@shared/logging/logger.port.js';
import type { Express } from 'express';
import type { RequestHandler } from 'express';
import type { RegisterUserUseCase } from '@application/use-cases/register-user.use-case.js';
import type { LoginUserUseCase } from '@application/use-cases/login-user.use-case.js';
import type { CreateTaskUseCase } from '@application/use-cases/create-task.use-case.js';
import type { BulkCreateTasksUseCase } from '@application/use-cases/bulk-create-tasks.use-case.js';
import type { ListTasksUseCase } from '@application/use-cases/list-tasks.use-case.js';
import type { GetTaskByIdUseCase } from '@application/use-cases/get-task-by-id.use-case.js';
import type { UpdateTaskUseCase } from '@application/use-cases/update-task.use-case.js';
import type { DeleteTaskUseCase } from '@application/use-cases/delete-task.use-case.js';
import type { DatabaseHealthPort } from '@application/ports/database-health.port.js';
import type { HealthCheckUseCase } from '@application/use-cases/health-check.use-case.js';
import type { JwtTokenServicePort } from '@application/ports/jwt-token-service.port.js';
import type { PasswordHasherPort } from '@application/ports/password-hasher.port.js';
import type { TaskRepositoryPort } from '@domain/ports/task-repository.port.js';
import type { UserRepositoryPort } from '@domain/ports/user-repository.port.js';
import type { AuthController } from '@infrastructure/http/controllers/auth.controller.js';
import type { HealthController } from '@infrastructure/http/controllers/health.controller.js';
import type { TasksController } from '@infrastructure/http/controllers/tasks.controller.js';

/**
 * Catálogo tipado de tudo que o container resolve.
 * Novas dependências: declare aqui e registre no provider correspondente.
 */
export interface DiRegistry {
  readonly appLogger: LoggerPort;
  readonly userRepository: UserRepositoryPort;
  readonly taskRepository: TaskRepositoryPort;
  readonly passwordHasher: PasswordHasherPort;
  readonly jwtTokenService: JwtTokenServicePort;
  readonly databaseHealth: DatabaseHealthPort;
  readonly healthCheckUseCase: HealthCheckUseCase;
  readonly registerUserUseCase: RegisterUserUseCase;
  readonly loginUserUseCase: LoginUserUseCase;
  readonly createTaskUseCase: CreateTaskUseCase;
  readonly bulkCreateTasksUseCase: BulkCreateTasksUseCase;
  readonly listTasksUseCase: ListTasksUseCase;
  readonly getTaskByIdUseCase: GetTaskByIdUseCase;
  readonly updateTaskUseCase: UpdateTaskUseCase;
  readonly deleteTaskUseCase: DeleteTaskUseCase;
  readonly authenticateMiddleware: RequestHandler;
  readonly healthController: HealthController;
  readonly authController: AuthController;
  readonly tasksController: TasksController;
  readonly httpApp: Express;
}

export type DiKey = keyof DiRegistry;
