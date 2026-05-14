import { beforeEach, describe, expect, it } from '@jest/globals';
import { TaskStatus } from '@domain/enums/task-status.enum.js';
import { TaskAccessDeniedError } from '@domain/errors/task-access-denied.error.js';
import { UpdateTaskUseCase } from '@application/use-cases/update-task.use-case.js';
import { buildTask } from '../factories/task.builder.js';
import { createTaskRepositoryMock } from '../factories/task-repository.mock.js';
import { TaskNotFoundError } from '@shared/errors/task-not-found.error.js';
import { ValidationError } from '@shared/errors/validation.error.js';

describe('UpdateTaskUseCase', () => {
  let tasks: ReturnType<typeof createTaskRepositoryMock>;
  let useCase: UpdateTaskUseCase;

  beforeEach(() => {
    tasks = createTaskRepositoryMock();
    useCase = new UpdateTaskUseCase(tasks);
  });

  it('applies patch and saves when owner matches', async () => {
    const task = buildTask({ id: 't1', ownerId: 'owner-1', status: TaskStatus.PENDING });
    tasks.findById.mockResolvedValue(task);
    tasks.save.mockResolvedValue(undefined);

    const result = await useCase.execute({
      ownerId: 'owner-1',
      taskId: 't1',
      patch: { title: 'Renamed', status: TaskStatus.IN_PROGRESS },
    });

    expect(tasks.save).toHaveBeenCalledTimes(1);
    expect(result.title).toBe('Renamed');
    expect(result.status).toBe(TaskStatus.IN_PROGRESS);
  });

  it('throws ValidationError when patch is empty', async () => {
    tasks.findById.mockResolvedValue(buildTask({ id: 't1', ownerId: 'owner-1' }));

    await expect(
      useCase.execute({ ownerId: 'owner-1', taskId: 't1', patch: {} }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(tasks.save).not.toHaveBeenCalled();
  });

  it('throws TaskNotFoundError when task is missing', async () => {
    tasks.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ ownerId: 'owner-1', taskId: 'x', patch: { title: 'Nope' } }),
    ).rejects.toBeInstanceOf(TaskNotFoundError);
  });

  it('throws TaskAccessDeniedError for non-owner', async () => {
    tasks.findById.mockResolvedValue(buildTask({ id: 't1', ownerId: 'other' }));

    await expect(
      useCase.execute({ ownerId: 'owner-1', taskId: 't1', patch: { title: 'Hack' } }),
    ).rejects.toBeInstanceOf(TaskAccessDeniedError);
  });
});
