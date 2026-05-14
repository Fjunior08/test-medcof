import { isTaskStatus } from '@domain/enums/task-status.enum.js';
import type { TaskStatusValue } from '@domain/enums/task-status.enum.js';
import type { TaskRepositoryPort } from '@domain/ports/task-repository.port.js';
import { TaskId } from '@domain/value-objects/task-id.vo.js';
import { TaskTitle } from '@domain/value-objects/task-title.vo.js';
import { TaskDescription } from '@domain/value-objects/task-description.vo.js';
import { UserId } from '@domain/value-objects/user-id.vo.js';
import type { UpdateTaskCommand } from '@application/dtos/task/task-commands.dto.js';
import type { TaskResponseDto } from '@application/dtos/task/task-response.dto.js';
import { toTaskResponseDto } from '@application/dtos/task/task-response.dto.js';
import { ensureOwnedTask } from '@application/task/ensure-owned-task.js';
import { ValidationError } from '@shared/errors/validation.error.js';

export class UpdateTaskUseCase {
  constructor(private readonly tasks: TaskRepositoryPort) {}

  async execute(command: UpdateTaskCommand): Promise<TaskResponseDto> {
    const taskId = TaskId.create(command.taskId);
    const ownerId = UserId.create(command.ownerId);
    const loaded = await this.tasks.findById(taskId);
    const task = ensureOwnedTask(loaded, command.taskId, ownerId);

    const { patch } = command;
    const hasAnyPatch =
      patch.title !== undefined ||
      patch.description !== undefined ||
      patch.clearDescription === true ||
      patch.status !== undefined;
    if (!hasAnyPatch) {
      throw new ValidationError('At least one field must be provided to update');
    }

    const updateInput: {
      title?: TaskTitle;
      description?: TaskDescription | undefined;
      clearDescription?: boolean;
      status?: TaskStatusValue;
    } = {};

    if (patch.title !== undefined) {
      updateInput.title = TaskTitle.create(patch.title);
    }
    if (patch.clearDescription === true) {
      updateInput.clearDescription = true;
    } else if (patch.description !== undefined) {
      updateInput.description = TaskDescription.optional(patch.description);
    }
    if (patch.status !== undefined) {
      if (!isTaskStatus(patch.status)) {
        throw new ValidationError('Invalid task status');
      }
      updateInput.status = patch.status;
    }

    task.applyUpdate(ownerId, updateInput);
    await this.tasks.save(task);
    return toTaskResponseDto(task);
  }
}
