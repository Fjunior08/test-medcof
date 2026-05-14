import { getHttpClient } from '@/services/http/client';
import { readSuccessData, readSuccessDataWithMeta } from '@/services/http/parse-response';
import type {
  CreateTaskPayload,
  ListTasksParams,
  PaginatedTasks,
  Task,
  TasksListMetadata,
  UpdateTaskPayload,
} from '@/types/task.types';
import { toSearchParams } from '@/utils/query-string';

function isTasksListMetadata(value: unknown): value is TasksListMetadata {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const o = value as Record<string, unknown>;
  return (
    typeof o['page'] === 'number' &&
    typeof o['limit'] === 'number' &&
    typeof o['total'] === 'number' &&
    typeof o['totalPages'] === 'number'
  );
}

function buildListQuery(params: ListTasksParams): string {
  return toSearchParams({
    page: params.page,
    limit: params.limit,
    search: params.search,
    status: params.status,
    sortBy: params.sortBy,
    order: params.order,
  });
}

export const tasksService = {
  async list(params: ListTasksParams): Promise<PaginatedTasks> {
    const client = getHttpClient();
    const res = await client.get<unknown>(`/tasks${buildListQuery(params)}`);
    const { data, meta } = readSuccessDataWithMeta(res);
    if (!isTasksListMetadata(meta)) {
      throw new Error('Tasks list response missing metadata');
    }
    return { tasks: data as readonly Task[], meta };
  },

  async create(payload: CreateTaskPayload): Promise<Task> {
    const client = getHttpClient();
    const res = await client.post<unknown>('/tasks', payload);
    const body = readSuccessData(res) as { readonly task: Task };
    return body.task;
  },

  async update(taskId: string, payload: UpdateTaskPayload): Promise<Task> {
    const client = getHttpClient();
    const res = await client.patch<unknown>(`/tasks/${encodeURIComponent(taskId)}`, payload);
    const body = readSuccessData(res) as { readonly task: Task };
    return body.task;
  },

  async remove(taskId: string): Promise<void> {
    const client = getHttpClient();
    await client.delete<unknown>(`/tasks/${encodeURIComponent(taskId)}`);
  },
} as const;
