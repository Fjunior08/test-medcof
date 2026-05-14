import type { TaskStatusValue } from '../enums/task-status.enum.js';
import { DomainError } from './domain.error.js';

export class InvalidTaskStatusTransitionError extends DomainError {
  readonly code = 'INVALID_TASK_STATUS_TRANSITION';

  constructor(
    public readonly fromStatus: TaskStatusValue,
    public readonly toStatus: TaskStatusValue,
  ) {
    super(`Cannot transition task status from ${fromStatus} to ${toStatus}`);
  }
}
