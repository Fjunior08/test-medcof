import type { TaskRepositoryPort } from '@domain/ports/task-repository.port.js';
import { TaskId } from '@domain/value-objects/task-id.vo.js';
import { UserId } from '@domain/value-objects/user-id.vo.js';
import type { GetTaskByIdQuery } from '@application/dtos/task/task-commands.dto.js';
import type { TaskResponseDto } from '@application/dtos/task/task-response.dto.js';
import { toTaskResponseDto } from '@application/dtos/task/task-response.dto.js';
import { ensureOwnedTask } from '@application/task/ensure-owned-task.js';

export class GetTaskByIdUseCase {
  constructor(private readonly tasks: TaskRepositoryPort) {}

  async execute(query: GetTaskByIdQuery): Promise<TaskResponseDto> {
    const taskId = TaskId.create(query.taskId);
    const ownerId = UserId.create(query.ownerId);
    const task = await this.tasks.findById(taskId);
    const owned = ensureOwnedTask(task, query.taskId, ownerId);
    return toTaskResponseDto(owned);
  }
}
