import { DomainError } from './domain.error.js';

export class InvalidTaskTitleError extends DomainError {
  readonly code = 'INVALID_TASK_TITLE';

  constructor(message = 'Task title is invalid') {
    super(message);
  }
}
