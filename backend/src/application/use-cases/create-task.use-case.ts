import { randomUUID } from 'node:crypto';
import type { TaskRepositoryPort } from '@domain/ports/task-repository.port.js';
import { Task } from '@domain/entities/task.entity.js';
import { TaskDescription } from '@domain/value-objects/task-description.vo.js';
import { TaskId } from '@domain/value-objects/task-id.vo.js';
import { TaskTitle } from '@domain/value-objects/task-title.vo.js';
import { UserId } from '@domain/value-objects/user-id.vo.js';
import type { CreateTaskCommand } from '@application/dtos/task/task-commands.dto.js';
import type { TaskResponseDto } from '@application/dtos/task/task-response.dto.js';
import { toTaskResponseDto } from '@application/dtos/task/task-response.dto.js';

export class CreateTaskUseCase {
  constructor(private readonly tasks: TaskRepositoryPort) {}

  async execute(command: CreateTaskCommand): Promise<TaskResponseDto> {
    const ownerId = UserId.create(command.ownerId);
    const task = Task.create({
      id: TaskId.create(randomUUID()),
      title: TaskTitle.create(command.title),
      description: TaskDescription.optional(command.description),
      ownerId,
    });
    await this.tasks.save(task);
    return toTaskResponseDto(task);
  }
}
