export const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'DONE'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export type TaskSortField = 'title' | 'createdAt' | 'updatedAt' | 'status';

export type SortOrder = 'asc' | 'desc';

export interface Task {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly status: TaskStatus;
  readonly ownerId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ListTasksParams {
  readonly page: number;
  readonly limit: number;
  readonly search: string | undefined;
  readonly status: TaskStatus | undefined;
  readonly sortBy: TaskSortField;
  readonly order: SortOrder;
}

export interface TasksListMetadata {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly totalPages: number;
}

export interface PaginatedTasks {
  readonly tasks: readonly Task[];
  readonly meta: TasksListMetadata;
}

export interface CreateTaskPayload {
  title: string;
  description?: string | undefined;
}

export interface UpdateTaskPayload {
  title?: string | undefined;
  description?: string | undefined;
  clearDescription?: boolean | undefined;
  status?: TaskStatus | undefined;
}
