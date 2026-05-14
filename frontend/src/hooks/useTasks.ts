import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { tasksService } from '@/services/tasks.service';
import type { ListTasksParams, PaginatedTasks, Task, UpdateTaskPayload } from '@/types/task.types';
import { getErrorMessage } from '@/utils/error-message';

export type TasksQueryStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseTasksState {
  readonly status: TasksQueryStatus;
  readonly data: PaginatedTasks | null;
  readonly error: string | null;
  readonly params: ListTasksParams;
  readonly setParams: (patch: Partial<ListTasksParams>) => void;
  readonly refetch: () => Promise<void>;
  readonly createTask: (input: { readonly title: string; readonly description?: string | undefined }) => Promise<Task>;
  readonly updateTask: (taskId: string, patch: UpdateTaskPayload) => Promise<Task>;
  readonly deleteTask: (taskId: string) => Promise<void>;
}

const defaultParams: ListTasksParams = {
  page: 1,
  limit: 20,
  search: undefined,
  status: undefined,
  sortBy: 'updatedAt',
  order: 'desc',
};

function buildOptimisticTask(
  optimisticId: string,
  input: { readonly title: string; readonly description?: string | undefined },
  ownerId: string,
): Task {
  const now = new Date().toISOString();
  return {
    id: optimisticId,
    title: input.title,
    description: input.description ?? null,
    status: 'PENDING',
    ownerId,
    createdAt: now,
    updatedAt: now,
  };
}

export function useTasks(): UseTasksState {
  const [params, setParamsState] = useState<ListTasksParams>(defaultParams);
  const [status, setStatus] = useState<TasksQueryStatus>('idle');
  const [data, setData] = useState<PaginatedTasks | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setParams = useCallback((patch: Partial<ListTasksParams>) => {
    setParamsState((prev) => ({
      ...prev,
      ...patch,
      ...(patch.search !== undefined || patch.status !== undefined ? { page: 1 } : {}),
    }));
  }, []);

  const refetch = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const result = await tasksService.list(params);
      setData(result);
      setStatus('success');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load tasks'));
      setStatus('error');
    }
  }, [params]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const createTask = useCallback(
    async (input: { readonly title: string; readonly description?: string | undefined }) => {
      const owner = useAuthStore.getState().user;
      const optimisticId = `optimistic:${String(Date.now())}:${Math.random().toString(36).slice(2, 9)}`;

      if (owner !== null) {
        const optimistic = buildOptimisticTask(optimisticId, input, owner.id);
        setData((prev) => {
          if (prev === null) {
            return {
              tasks: [optimistic],
              meta: {
                page: params.page,
                limit: params.limit,
                total: 1,
                totalPages: 1,
              },
            };
          }
          const nextTotal = prev.meta.total + 1;
          return {
            tasks: [optimistic, ...prev.tasks],
            meta: {
              ...prev.meta,
              total: nextTotal,
              totalPages: Math.max(1, Math.ceil(nextTotal / prev.meta.limit)),
            },
          };
        });
      }

      try {
        const created = await tasksService.create(input);
        await refetch();
        return created;
      } catch (err) {
        await refetch().catch(() => undefined);
        throw err;
      }
    },
    [params.limit, params.page, refetch],
  );

  const updateTask = useCallback(
    async (taskId: string, patch: UpdateTaskPayload) => {
      const updated = await tasksService.update(taskId, patch);
      await refetch();
      return updated;
    },
    [refetch],
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      await tasksService.remove(taskId);
      await refetch();
    },
    [refetch],
  );

  return useMemo(
    (): UseTasksState => ({
      status,
      data,
      error,
      params,
      setParams,
      refetch,
      createTask,
      updateTask,
      deleteTask,
    }),
    [status, data, error, params, setParams, refetch, createTask, updateTask, deleteTask],
  );
}
