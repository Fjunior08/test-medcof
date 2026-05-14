import { describe, expect, it } from '@jest/globals';
import type { ListTasksQuery } from '@application/dtos/task/task-commands.dto.js';
import { ListTasksUseCase } from '@application/use-cases/list-tasks.use-case.js';
import { TaskStatus } from '@domain/enums/task-status.enum.js';
import { buildTask } from '../factories/task.builder.js';
import { createTaskRepositoryMock } from '../factories/task-repository.mock.js';

function baseQuery(overrides: Partial<ListTasksQuery> = {}): ListTasksQuery {
  return {
    ownerId: 'me',
    page: 1,
    limit: 20,
    sortBy: 'updatedAt',
    order: 'desc',
    ...overrides,
  };
}

describe('ListTasksUseCase', () => {
  it('returns only tasks for the given owner with pagination metadata', async () => {
    const tasks = createTaskRepositoryMock();
    const mine = buildTask({ ownerId: 'me', id: 't1', title: 'Mine' });
    tasks.listForOwner.mockResolvedValue({ items: [mine], total: 1 });
    const useCase = new ListTasksUseCase(tasks);

    const result = await useCase.execute(baseQuery({ ownerId: 'me' }));

    expect(tasks.listForOwner).toHaveBeenCalledTimes(1);
    expect(tasks.listForOwner).toHaveBeenCalledWith({
      ownerId: expect.any(Object),
      skip: 0,
      take: 20,
      search: undefined,
      status: undefined,
      sortBy: 'updatedAt',
      order: 'desc',
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.id).toBe('t1');
    expect(result.items[0]?.ownerId).toBe('me');
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it('uses skip based on page and limit', async () => {
    const tasks = createTaskRepositoryMock();
    tasks.listForOwner.mockResolvedValue({ items: [], total: 0 });
    const useCase = new ListTasksUseCase(tasks);

    await useCase.execute(baseQuery({ page: 3, limit: 10 }));

    expect(tasks.listForOwner).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 }),
    );
  });

  it('passes search and status to the repository', async () => {
    const tasks = createTaskRepositoryMock();
    tasks.listForOwner.mockResolvedValue({ items: [], total: 0 });
    const useCase = new ListTasksUseCase(tasks);

    await useCase.execute(
      baseQuery({ search: 'doc', status: TaskStatus.PENDING }),
    );

    expect(tasks.listForOwner).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'doc',
        status: TaskStatus.PENDING,
      }),
    );
  });

  it('sets totalPages to 0 when there are no rows', async () => {
    const tasks = createTaskRepositoryMock();
    tasks.listForOwner.mockResolvedValue({ items: [], total: 0 });
    const useCase = new ListTasksUseCase(tasks);

    const result = await useCase.execute(baseQuery());

    expect(result.totalPages).toBe(0);
  });
});
