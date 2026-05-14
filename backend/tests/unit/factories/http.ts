import { jest } from '@jest/globals';
import type { Request, Response } from 'express';

/** Express `NextFunction` has overloads that fight with `jest.MockedFunction`; tests only need the error-first shape. */
export type MockNextFunction = jest.MockedFunction<(err?: unknown) => void>;

export interface MockResponse {
  readonly res: Response;
  readonly status: jest.Mock;
  readonly json: jest.Mock;
}

/**
 * Express `Response` double focused on `status().json()` chaining used by this API.
 */
export function createMockResponse(): MockResponse {
  const json = jest.fn().mockReturnThis();
  const status = jest.fn().mockReturnValue({ json });
  const res = { status, json } as unknown as Response;
  return { res, status, json };
}

export function createMockNext(): MockNextFunction {
  return jest.fn();
}

export function createRequest(partial: Partial<Request> = {}): Request {
  return {
    headers: {},
    body: {},
    params: {},
    query: {},
    requestId: 'test-request-id',
    ...partial,
  } as Request;
}
