import { describe, expect, it } from '@jest/globals';
import { BulkCreateTasksUseCase } from '@application/use-cases/bulk-create-tasks.use-case.js';
import { createTaskRepositoryMock } from '../factories/task-repository.mock.js';

describe('BulkCreateTasksUseCase', () => {
  it('delegates to repository.createMany exactly once (no per-row inserts)', async () => {
    // Arrange
    const tasks = createTaskRepositoryMock();
    tasks.createMany.mockResolvedValue(3);
    const useCase = new BulkCreateTasksUseCase(tasks);
    const items = [
      { title: 'A', description: undefined },
      { title: 'B', description: 'x' },
      { title: 'C' },
    ];

    // Act
    const result = await useCase.execute({ ownerId: 'owner-1', items });

    // Assert
    expect(tasks.createMany).toHaveBeenCalledTimes(1);
    const batch = tasks.createMany.mock.calls[0]?.[0];
    expect(batch).toHaveLength(3);
    expect(result.count).toBe(3);
    expect(result.tasks).toHaveLength(3);
    expect(tasks.save).not.toHaveBeenCalled();
  });
});
