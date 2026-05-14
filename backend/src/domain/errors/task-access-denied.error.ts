import { DomainError } from './domain.error.js';

export class TaskAccessDeniedError extends DomainError {
  readonly code = 'TASK_ACCESS_DENIED';

  constructor(message = 'Only the task owner can perform this operation') {
    super(message);
  }
}
