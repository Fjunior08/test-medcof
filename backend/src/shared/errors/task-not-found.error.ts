import { AppError } from './app.error.js';

export class TaskNotFoundError extends AppError {
  constructor(taskId: string) {
    super(`Task "${taskId}" was not found`, {
      code: 'TASK_NOT_FOUND',
      statusCode: 404,
    });
    this.name = 'TaskNotFoundError';
  }
}
