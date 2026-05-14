import { beforeEach, describe, expect, it } from '@jest/globals';
import { CreateTaskUseCase } from '@application/use-cases/create-task.use-case.js';
import { createTaskRepositoryMock } from '../factories/task-repository.mock.js';

describe('CreateTaskUseCase', () => {
  let tasks: ReturnType<typeof createTaskRepositoryMock>;
  let useCase: CreateTaskUseCase;

  beforeEach(() => {
    tasks = createTaskRepositoryMock();
    useCase = new CreateTaskUseCase(tasks);
  });

  it('persists a new task for the owner and returns a DTO', async () => {
    // Arrange
    tasks.save.mockResolvedValue(undefined);

    // Act
    const result = await useCase.execute({
      ownerId: 'owner-1',
      title: 'Ship feature',
      description: '  details  ',
    });

    // Assert
    expect(tasks.save).toHaveBeenCalledTimes(1);
    const saved = tasks.save.mock.calls[0]?.[0];
    expect(saved).toBeDefined();
    expect(saved?.ownerId.value).toBe('owner-1');
    expect(saved?.title.value).toBe('Ship feature');
    expect(saved?.description?.value).toBe('details');
    expect(result.title).toBe('Ship feature');
    expect(result.ownerId).toBe('owner-1');
  });
});
