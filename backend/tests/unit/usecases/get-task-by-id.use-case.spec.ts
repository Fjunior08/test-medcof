import { beforeEach, describe, expect, it } from '@jest/globals';
import { GetTaskByIdUseCase } from '@application/use-cases/get-task-by-id.use-case.js';
import { TaskAccessDeniedError } from '@domain/errors/task-access-denied.error.js';
import { buildTask } from '../factories/task.builder.js';
import { createTaskRepositoryMock } from '../factories/task-repository.mock.js';
import { TaskNotFoundError } from '@shared/errors/task-not-found.error.js';

describe('GetTaskByIdUseCase', () => {
  let tasks: ReturnType<typeof createTaskRepositoryMock>;
  let useCase: GetTaskByIdUseCase;

  beforeEach(() => {
    tasks = createTaskRepositoryMock();
    useCase = new GetTaskByIdUseCase(tasks);
  });

  it('returns the task when it exists and belongs to the owner', async () => {
    const task = buildTask({ id: 't1', ownerId: 'owner-1', title: 'Hello' });
    tasks.findById.mockResolvedValue(task);

    const result = await useCase.execute({ ownerId: 'owner-1', taskId: 't1' });

    expect(result.id).toBe('t1');
    expect(result.title).toBe('Hello');
  });

  it('throws TaskNotFoundError when the task does not exist', async () => {
    tasks.findById.mockResolvedValue(null);

    await expect(useCase.execute({ ownerId: 'owner-1', taskId: 'missing' })).rejects.toBeInstanceOf(
      TaskNotFoundError,
    );
  });

  it('throws TaskAccessDeniedError when the task belongs to another user', async () => {
    tasks.findById.mockResolvedValue(buildTask({ id: 't1', ownerId: 'someone-else' }));

    await expect(useCase.execute({ ownerId: 'owner-1', taskId: 't1' })).rejects.toBeInstanceOf(
      TaskAccessDeniedError,
    );
  });
});
