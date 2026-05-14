import type { TaskRepositoryPort } from '@domain/ports/task-repository.port.js';
import { TaskId } from '@domain/value-objects/task-id.vo.js';
import { UserId } from '@domain/value-objects/user-id.vo.js';
import type { DeleteTaskCommand } from '@application/dtos/task/task-commands.dto.js';
import { ensureOwnedTask } from '@application/task/ensure-owned-task.js';
import { TaskNotFoundError } from '@shared/errors/task-not-found.error.js';

export class DeleteTaskUseCase {
  constructor(private readonly tasks: TaskRepositoryPort) {}

  async execute(command: DeleteTaskCommand): Promise<void> {
    const taskId = TaskId.create(command.taskId);
    const ownerId = UserId.create(command.ownerId);
    const loaded = await this.tasks.findById(taskId);
    ensureOwnedTask(loaded, command.taskId, ownerId);

    const deleted = await this.tasks.deleteByIdAndOwner(taskId, ownerId);
    if (deleted === 0) {
      throw new TaskNotFoundError(command.taskId);
    }
  }
}
