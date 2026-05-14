import { jest } from '@jest/globals';
import type { LoggerPort } from '@shared/logging/logger.port.js';

export function createLoggerMock(): LoggerPort {
  const mock: LoggerPort = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    child: jest.fn(() => mock),
  };
  return mock;
}
