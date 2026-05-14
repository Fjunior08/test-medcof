import type { TaskStatusValue } from '@domain/enums/task-status.enum.js';
import type { Task } from '@domain/entities/task.entity.js';

export interface TaskResponseDto {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly status: TaskStatusValue;
  readonly ownerId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function toTaskResponseDto(task: Task): TaskResponseDto {
  return {
    id: task.id.value,
    title: task.title.value,
    description: task.description?.value ?? null,
    status: task.status,
    ownerId: task.ownerId.value,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}
