import { describe, expect, it } from '@jest/globals';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library.js';
import { mapPrismaClientError } from '@infrastructure/database/prisma-client-error.mapper.js';

describe('mapPrismaClientError', () => {
  it('maps P2002 to 409 unique constraint', () => {
    const err = new PrismaClientKnownRequestError('dup', {
      code: 'P2002',
      clientVersion: 'test',
      meta: { target: ['email'] },
    });
    const m = mapPrismaClientError(err);
    expect(m).toEqual(
      expect.objectContaining({
        statusCode: 409,
        code: 'UNIQUE_CONSTRAINT_VIOLATION',
        isOperational: true,
      }),
    );
    expect(m?.logExtra).toEqual({ constraintFields: 'email' });
  });

  it('maps P2025 to 404', () => {
    const err = new PrismaClientKnownRequestError('nf', { code: 'P2025', clientVersion: 'test' });
    expect(mapPrismaClientError(err)).toEqual(
      expect.objectContaining({ statusCode: 404, code: 'RECORD_NOT_FOUND', isOperational: true }),
    );
  });

  it('maps connection errors to 503', () => {
    const err = new PrismaClientKnownRequestError('conn', { code: 'P1001', clientVersion: 'test' });
    expect(mapPrismaClientError(err)?.statusCode).toBe(503);
  });

  it('maps PrismaClientValidationError to 400', () => {
    const err = new PrismaClientValidationError('bad', { clientVersion: 'test' });
    expect(mapPrismaClientError(err)).toEqual(
      expect.objectContaining({ statusCode: 400, code: 'PRISMA_VALIDATION_ERROR', isOperational: true }),
    );
  });

  it('returns null for unrelated errors', () => {
    expect(mapPrismaClientError(new Error('plain'))).toBeNull();
  });
});
