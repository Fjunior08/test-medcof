import type { PrismaClient } from '@prisma/client';
import type { DatabaseHealthPort } from '@application/ports/database-health.port.js';
import { withTransientRetry } from '@shared/lib/retry-transient.js';

export class PrismaDatabaseHealth implements DatabaseHealthPort {
  constructor(private readonly prisma: PrismaClient) {}

  ping(): Promise<void> {
    return withTransientRetry(() => this.prisma.$queryRaw`SELECT 1`, { maxAttempts: 3, baseDelayMs: 50 });
  }
}
