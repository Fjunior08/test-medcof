import type { TaskStatusValue } from '../enums/task-status.enum.js';
import type { Task } from '../entities/task.entity.js';
import type { TaskId } from '../value-objects/task-id.vo.js';
import type { UserId } from '../value-objects/user-id.vo.js';

/** Allowed sort columns for owner-scoped listing (maps 1:1 to persistence). */
export type TaskListSortField = 'title' | 'createdAt' | 'updatedAt' | 'status';

export type TaskListSortOrder = 'asc' | 'desc';

export interface ListTasksForOwnerCriteria {
  readonly ownerId: UserId;
  readonly skip: number;
  readonly take: number;
  readonly search?: string | undefined;
  readonly status?: TaskStatusValue | undefined;
  readonly sortBy: TaskListSortField;
  readonly order: TaskListSortOrder;
}

export interface ListTasksForOwnerResult {
  readonly items: readonly Task[];
  readonly total: number;
}

export interface TaskRepositoryPort {
  save(task: Task): Promise<void>;
  findById(id: TaskId): Promise<Task | null>;
  /**
   * Paginated listing for one owner with optional filters. `total` matches the same `where` as `items`.
   */
  listForOwner(criteria: ListTasksForOwnerCriteria): Promise<ListTasksForOwnerResult>;
  /**
   * Single round-trip bulk insert. Caller supplies fully-built {@link Task} aggregates (ids + timestamps).
   */
  createMany(tasks: Task[]): Promise<number>;
  /**
   * Deletes when both id and owner match. Returns number of deleted rows (0 or 1).
   */
  deleteByIdAndOwner(id: TaskId, ownerId: UserId): Promise<number>;
}
