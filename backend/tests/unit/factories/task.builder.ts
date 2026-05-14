import { Task } from '@domain/entities/task.entity.js';
import { TaskStatus } from '@domain/enums/task-status.enum.js';
import type { TaskStatusValue } from '@domain/enums/task-status.enum.js';
import { TaskDescription } from '@domain/value-objects/task-description.vo.js';
import { TaskId } from '@domain/value-objects/task-id.vo.js';
import { TaskTitle } from '@domain/value-objects/task-title.vo.js';
import { UserId } from '@domain/value-objects/user-id.vo.js';

export interface TaskReconstituteProps {
  readonly id?: string;
  readonly title?: string;
  readonly description?: string | undefined;
  readonly status?: TaskStatusValue;
  readonly ownerId?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export function buildTask(props: TaskReconstituteProps = {}): Task {
  const createdAt = props.createdAt ?? new Date('2024-01-01T00:00:00.000Z');
  const updatedAt = props.updatedAt ?? new Date('2024-01-01T00:00:00.000Z');
  return Task.reconstitute({
    id: TaskId.create(props.id ?? 'task-default-id'),
    title: TaskTitle.create(props.title ?? 'Default title'),
    description:
      props.description === undefined
        ? undefined
        : TaskDescription.optional(props.description),
    status: props.status ?? TaskStatus.PENDING,
    ownerId: UserId.create(props.ownerId ?? 'owner-default-id'),
    createdAt,
    updatedAt,
  });
}
