import { DomainError } from './domain.error.js';

export class InvalidTaskDescriptionError extends DomainError {
  readonly code = 'INVALID_TASK_DESCRIPTION';

  constructor(message = 'Task description is invalid') {
    super(message);
  }
}
