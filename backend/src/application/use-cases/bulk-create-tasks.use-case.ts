import { randomUUID } from 'node:crypto';
import type { TaskRepositoryPort } from '@domain/ports/task-repository.port.js';
import { Task } from '@domain/entities/task.entity.js';
import { TaskDescription } from '@domain/value-objects/task-description.vo.js';
import { TaskId } from '@domain/value-objects/task-id.vo.js';
import { TaskTitle } from '@domain/value-objects/task-title.vo.js';
import { UserId } from '@domain/value-objects/user-id.vo.js';
import type { BulkCreateTasksCommand } from '@application/dtos/task/task-commands.dto.js';
import type { BulkCreateTasksResult } from '@application/dtos/task/task-commands.dto.js';
import { toTaskResponseDto } from '@application/dtos/task/task-response.dto.js';

export class BulkCreateTasksUseCase {
  constructor(private readonly tasks: TaskRepositoryPort) {}

  async execute(command: BulkCreateTasksCommand): Promise<BulkCreateTasksResult> {
    const ownerId = UserId.create(command.ownerId);
    const clock = (): Date => new Date();
    const now = clock();
    const aggregates = command.items.map((item) =>
      Task.create({
        id: TaskId.create(randomUUID()),
        title: TaskTitle.create(item.title),
        description: TaskDescription.optional(item.description),
        ownerId,
        clock: () => now,
      }),
    );

    const count = await this.tasks.createMany(aggregates);
    return {
      tasks: aggregates.map(toTaskResponseDto),
      count,
    };
  }
}
