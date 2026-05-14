import { describe, expect, it, jest } from '@jest/globals';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library.js';
import { withTransientRetry, isTransientPrismaError } from '@shared/lib/retry-transient.js';

describe('withTransientRetry', () => {
  it('returns result on first success', async () => {
    const fn = jest.fn(async () => 42);
    await expect(withTransientRetry(fn)).resolves.toBe(42);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on transient Prisma error then succeeds', async () => {
    let calls = 0;
    const fn = jest.fn(async () => {
      calls += 1;
      if (calls < 2) {
        throw new PrismaClientKnownRequestError('x', { code: 'P1001', clientVersion: 't' });
      }
      return 'ok';
    });
    await expect(withTransientRetry(fn, { maxAttempts: 3, baseDelayMs: 1 })).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('does not retry non-transient errors', async () => {
    const fn = jest.fn(async () => {
      throw new PrismaClientKnownRequestError('x', { code: 'P2002', clientVersion: 't' });
    });
    await expect(withTransientRetry(fn, { maxAttempts: 3, baseDelayMs: 1 })).rejects.toBeInstanceOf(
      PrismaClientKnownRequestError,
    );
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('isTransientPrismaError', () => {
  it('identifies known transient codes', () => {
    expect(
      isTransientPrismaError(new PrismaClientKnownRequestError('x', { code: 'P2034', clientVersion: 't' })),
    ).toBe(true);
    expect(isTransientPrismaError(new Error('plain'))).toBe(false);
  });
});
