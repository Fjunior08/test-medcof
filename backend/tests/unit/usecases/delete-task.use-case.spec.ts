import { beforeEach, describe, expect, it } from '@jest/globals';
import { TaskAccessDeniedError } from '@domain/errors/task-access-denied.error.js';
import { DeleteTaskUseCase } from '@application/use-cases/delete-task.use-case.js';
import { buildTask } from '../factories/task.builder.js';
import { createTaskRepositoryMock } from '../factories/task-repository.mock.js';
import { TaskNotFoundError } from '@shared/errors/task-not-found.error.js';

describe('DeleteTaskUseCase', () => {
  let tasks: ReturnType<typeof createTaskRepositoryMock>;
  let useCase: DeleteTaskUseCase;

  beforeEach(() => {
    tasks = createTaskRepositoryMock();
    useCase = new DeleteTaskUseCase(tasks);
  });

  it('deletes when owner matches', async () => {
    tasks.findById.mockResolvedValue(buildTask({ id: 't1', ownerId: 'owner-1' }));
    tasks.deleteByIdAndOwner.mockResolvedValue(1);

    await useCase.execute({ ownerId: 'owner-1', taskId: 't1' });

    expect(tasks.deleteByIdAndOwner).toHaveBeenCalledTimes(1);
  });

  it('throws TaskNotFound when task does not exist', async () => {
    tasks.findById.mockResolvedValue(null);

    await expect(useCase.execute({ ownerId: 'owner-1', taskId: 'x' })).rejects.toBeInstanceOf(
      TaskNotFoundError,
    );
    expect(tasks.deleteByIdAndOwner).not.toHaveBeenCalled();
  });

  it('throws TaskAccessDeniedError when owner mismatches', async () => {
    tasks.findById.mockResolvedValue(buildTask({ id: 't1', ownerId: 'other' }));

    await expect(useCase.execute({ ownerId: 'owner-1', taskId: 't1' })).rejects.toBeInstanceOf(
      TaskAccessDeniedError,
    );
    expect(tasks.deleteByIdAndOwner).not.toHaveBeenCalled();
  });

  it('throws TaskNotFound when delete races to zero rows', async () => {
    tasks.findById.mockResolvedValue(buildTask({ id: 't1', ownerId: 'owner-1' }));
    tasks.deleteByIdAndOwner.mockResolvedValue(0);

    await expect(useCase.execute({ ownerId: 'owner-1', taskId: 't1' })).rejects.toBeInstanceOf(
      TaskNotFoundError,
    );
  });
});
