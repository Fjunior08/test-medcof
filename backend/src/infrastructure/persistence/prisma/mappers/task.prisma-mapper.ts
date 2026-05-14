import { Task } from '@domain/entities/task.entity.js';
import { isTaskStatus } from '@domain/enums/task-status.enum.js';
import { TaskId } from '@domain/value-objects/task-id.vo.js';
import { TaskTitle } from '@domain/value-objects/task-title.vo.js';
import { TaskDescription } from '@domain/value-objects/task-description.vo.js';
import { UserId } from '@domain/value-objects/user-id.vo.js';

/** Forma persistida da linha `tasks` (sem dependência de tipos gerados do Prisma no domínio). */
export interface TaskRowRecord {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly status: string;
  readonly ownerId: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export function mapTaskAggregateToRow(task: Task): TaskRowRecord {
  return {
    id: task.id.value,
    title: task.title.value,
    description: task.description?.value ?? null,
    status: task.status,
    ownerId: task.ownerId.value,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

export function mapTaskRowToAggregate(row: TaskRowRecord): Task {
  if (!isTaskStatus(row.status)) {
    throw new Error(`Invalid task status persisted for id ${row.id}`);
  }
  return Task.reconstitute({
    id: TaskId.create(row.id),
    title: TaskTitle.create(row.title),
    description:
      row.description === null || row.description === ''
        ? undefined
        : TaskDescription.optional(row.description),
    status: row.status,
    ownerId: UserId.create(row.ownerId),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}
