import { jest } from '@jest/globals';
import type { JwtTokenServicePort } from '@application/ports/jwt-token-service.port.js';

export type JwtTokenServiceMock = jest.Mocked<JwtTokenServicePort>;

export function createJwtTokenServiceMock(): JwtTokenServiceMock {
  return {
    signAccessToken: jest.fn(),
    verifyAccessToken: jest.fn(),
  };
}
