import { DomainError } from './domain.error.js';

export class InvalidTaskIdError extends DomainError {
  readonly code = 'INVALID_TASK_ID';

  constructor(message = 'Task id is invalid') {
    super(message);
  }
}
