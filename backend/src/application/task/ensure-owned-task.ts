import type { Task } from '@domain/entities/task.entity.js';
import type { UserId } from '@domain/value-objects/user-id.vo.js';
import { TaskNotFoundError } from '@shared/errors/task-not-found.error.js';

/**
 * Task existe e pertence ao owner (regra no agregado via {@link Task.assertOwnedBy}).
 */
export function ensureOwnedTask(task: Task | null, taskId: string, ownerId: UserId): Task {
  if (task === null) {
    throw new TaskNotFoundError(taskId);
  }
  task.assertOwnedBy(ownerId);
  return task;
}
