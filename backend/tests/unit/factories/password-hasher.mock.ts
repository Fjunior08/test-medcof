import { jest } from '@jest/globals';
import type { PasswordHasherPort } from '@application/ports/password-hasher.port.js';

export type PasswordHasherMock = jest.Mocked<PasswordHasherPort>;

export function createPasswordHasherMock(): PasswordHasherMock {
  return {
    hash: jest.fn(),
    compare: jest.fn(),
  };
}
