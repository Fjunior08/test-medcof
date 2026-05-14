import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library.js';

const TRANSIENT_PRISMA_CODES = new Set([
  'P1001',
  'P1002',
  'P1008',
  'P1017',
  'P2034',
]);

export function isTransientPrismaError(err: unknown): boolean {
  return err instanceof PrismaClientKnownRequestError && TRANSIENT_PRISMA_CODES.has(err.code);
}

/**
 * Poucas tentativas com backoff linear — útil para pings e leituras após falhas transitórias de rede/DB.
 */
export async function withTransientRetry<T>(
  fn: () => Promise<T>,
  options?: { readonly maxAttempts?: number; readonly baseDelayMs?: number },
): Promise<T> {
  const maxAttempts = options?.maxAttempts ?? 3;
  const baseDelayMs = options?.baseDelayMs ?? 40;
  let last: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      last = err;
      if (attempt === maxAttempts || !isTransientPrismaError(err)) {
        throw err;
      }
      const delayMs = baseDelayMs * attempt;
      await new Promise<void>((resolve) => {
        setTimeout(resolve, delayMs);
      });
    }
  }
  throw last instanceof Error ? last : new Error(String(last));
}
