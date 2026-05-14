import { TaskStatus, type TaskStatusValue } from '../enums/task-status.enum.js';
import { InvalidTaskStatusTransitionError } from '../errors/invalid-task-status-transition.error.js';
import { TaskAccessDeniedError } from '../errors/task-access-denied.error.js';
import type { TaskDescription } from '../value-objects/task-description.vo.js';
import type { TaskId } from '../value-objects/task-id.vo.js';
import type { TaskTitle } from '../value-objects/task-title.vo.js';
import type { UserId } from '../value-objects/user-id.vo.js';

function cloneDate(date: Date): Date {
  return new Date(date.getTime());
}

interface TaskInternal {
  id: TaskId;
  title: TaskTitle;
  description?: TaskDescription | undefined;
  status: TaskStatusValue;
  ownerId: UserId;
  createdAt: Date;
  updatedAt: Date;
}

export class Task {
  private constructor(private internal: TaskInternal) {}

  static create(input: {
    id: TaskId;
    title: TaskTitle;
    ownerId: UserId;
    description?: TaskDescription | undefined;
    clock?: () => Date;
  }): Task {
    const now = cloneDate(input.clock?.() ?? new Date());
    return new Task({
      id: input.id,
      title: input.title,
      description: input.description,
      status: TaskStatus.PENDING,
      ownerId: input.ownerId,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: {
    id: TaskId;
    title: TaskTitle;
    description?: TaskDescription | undefined;
    status: TaskStatusValue;
    ownerId: UserId;
    createdAt: Date;
    updatedAt: Date;
  }): Task {
    return new Task({
      id: props.id,
      title: props.title,
      description: props.description,
      status: props.status,
      ownerId: props.ownerId,
      createdAt: cloneDate(props.createdAt),
      updatedAt: cloneDate(props.updatedAt),
    });
  }

  get id(): TaskId {
    return this.internal.id;
  }

  get title(): TaskTitle {
    return this.internal.title;
  }

  get description(): TaskDescription | undefined {
    return this.internal.description;
  }

  get status(): TaskStatusValue {
    return this.internal.status;
  }

  get ownerId(): UserId {
    return this.internal.ownerId;
  }

  get createdAt(): Date {
    return cloneDate(this.internal.createdAt);
  }

  get updatedAt(): Date {
    return cloneDate(this.internal.updatedAt);
  }

  /**
   * Domain rule: only the owner may act on the task (call before mutating state).
   */
  assertOwnedBy(userId: UserId): void {
    if (!this.internal.ownerId.equals(userId)) {
      throw new TaskAccessDeniedError();
    }
  }

  rename(title: TaskTitle, actorId: UserId, clock?: () => Date): void {
    this.assertOwnedBy(actorId);
    this.internal.title = title;
    this.touch(clock);
  }

  updateDescription(description: TaskDescription | undefined, actorId: UserId, clock?: () => Date): void {
    this.assertOwnedBy(actorId);
    this.internal.description = description;
    this.touch(clock);
  }

  startProgress(actorId: UserId, clock?: () => Date): void {
    this.assertOwnedBy(actorId);
    if (this.internal.status !== TaskStatus.PENDING) {
      throw new InvalidTaskStatusTransitionError(this.internal.status, TaskStatus.IN_PROGRESS);
    }
    this.internal.status = TaskStatus.IN_PROGRESS;
    this.touch(clock);
  }

  pauseProgress(actorId: UserId, clock?: () => Date): void {
    this.assertOwnedBy(actorId);
    if (this.internal.status !== TaskStatus.IN_PROGRESS) {
      throw new InvalidTaskStatusTransitionError(this.internal.status, TaskStatus.PENDING);
    }
    this.internal.status = TaskStatus.PENDING;
    this.touch(clock);
  }

  complete(actorId: UserId, clock?: () => Date): void {
    this.assertOwnedBy(actorId);
    if (
      this.internal.status !== TaskStatus.PENDING &&
      this.internal.status !== TaskStatus.IN_PROGRESS
    ) {
      throw new InvalidTaskStatusTransitionError(this.internal.status, TaskStatus.DONE);
    }
    this.internal.status = TaskStatus.DONE;
    this.touch(clock);
  }

  reopen(actorId: UserId, clock?: () => Date): void {
    this.assertOwnedBy(actorId);
    if (this.internal.status !== TaskStatus.DONE) {
      throw new InvalidTaskStatusTransitionError(this.internal.status, TaskStatus.PENDING);
    }
    this.internal.status = TaskStatus.PENDING;
    this.touch(clock);
  }

  /**
   * Partial update for application layer (title, description, status) with domain rules.
   */
  applyUpdate(
    actorId: UserId,
    input: {
      title?: TaskTitle;
      description?: TaskDescription | undefined;
      clearDescription?: boolean;
      status?: TaskStatusValue;
    },
    clock?: () => Date,
  ): void {
    this.assertOwnedBy(actorId);
    if (input.title !== undefined) {
      this.internal.title = input.title;
    }
    if (input.clearDescription === true) {
      this.internal.description = undefined;
    } else if (input.description !== undefined) {
      this.internal.description = input.description;
    }
    if (input.status !== undefined) {
      if (!Task.canTransition(this.internal.status, input.status)) {
        throw new InvalidTaskStatusTransitionError(this.internal.status, input.status);
      }
      this.internal.status = input.status;
    }
    this.touch(clock);
  }

  private static canTransition(from: TaskStatusValue, to: TaskStatusValue): boolean {
    if (from === to) {
      return true;
    }
    const allowed: Record<TaskStatusValue, TaskStatusValue[]> = {
      [TaskStatus.PENDING]: [TaskStatus.IN_PROGRESS, TaskStatus.DONE],
      [TaskStatus.IN_PROGRESS]: [TaskStatus.PENDING, TaskStatus.DONE],
      [TaskStatus.DONE]: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS],
    };
    return allowed[from].includes(to);
  }

  private touch(clock?: () => Date): void {
    this.internal.updatedAt = cloneDate(clock?.() ?? new Date());
  }
}
