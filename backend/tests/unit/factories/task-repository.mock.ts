import { jest } from '@jest/globals';
import type { TaskRepositoryPort } from '@domain/ports/task-repository.port.js';

export type TaskRepositoryMock = jest.Mocked<TaskRepositoryPort>;

export function createTaskRepositoryMock(): TaskRepositoryMock {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    listForOwner: jest.fn(),
    createMany: jest.fn(),
    deleteByIdAndOwner: jest.fn(),
  };
}
