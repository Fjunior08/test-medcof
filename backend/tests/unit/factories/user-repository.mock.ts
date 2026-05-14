import { jest } from '@jest/globals';
import type { UserRepositoryPort } from '@domain/ports/user-repository.port.js';

export type UserRepositoryMock = jest.Mocked<UserRepositoryPort>;

export function createUserRepositoryMock(): UserRepositoryMock {
  return {
    save: jest.fn(),
    tryCreate: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
  };
}
