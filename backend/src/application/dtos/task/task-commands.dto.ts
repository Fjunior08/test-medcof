import type { TaskStatusValue } from '@domain/enums/task-status.enum.js';
import type { TaskListSortField, TaskListSortOrder } from '@domain/ports/task-repository.port.js';
import type { TaskResponseDto } from './task-response.dto.js';

export interface CreateTaskCommand {
  readonly ownerId: string;
  readonly title: string;
  readonly description?: string | undefined;
}

export interface BulkCreateTaskItem {
  readonly title: string;
  readonly description?: string | undefined;
}

export interface BulkCreateTasksCommand {
  readonly ownerId: string;
  readonly items: readonly BulkCreateTaskItem[];
}

export interface BulkCreateTasksResult {
  readonly tasks: TaskResponseDto[];
  readonly count: number;
}

export interface ListTasksQuery {
  readonly ownerId: string;
  readonly page: number;
  readonly limit: number;
  readonly search?: string | undefined;
  readonly status?: TaskStatusValue | undefined;
  readonly sortBy: TaskListSortField;
  readonly order: TaskListSortOrder;
}

export interface ListTasksResult {
  readonly items: TaskResponseDto[];
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly totalPages: number;
}

export interface GetTaskByIdQuery {
  readonly ownerId: string;
  readonly taskId: string;
}

export interface UpdateTaskCommand {
  readonly ownerId: string;
  readonly taskId: string;
  readonly patch: {
    readonly title?: string | undefined;
    readonly description?: string | undefined;
    readonly clearDescription?: boolean | undefined;
    readonly status?: string | undefined;
  };
}

export interface DeleteTaskCommand {
  readonly ownerId: string;
  readonly taskId: string;
}
