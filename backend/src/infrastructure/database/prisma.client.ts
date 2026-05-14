import { PrismaClient } from '@prisma/client';
import type { NodeEnvironment } from '@shared/config/env.schema.js';

type PrismaGlobal = typeof globalThis & {
  __medcof_prisma__?: PrismaClient;
  __medcof_prisma_node_env__?: NodeEnvironment;
};

const globalForPrisma = globalThis as PrismaGlobal;

function newPrismaClient(nodeEnv: NodeEnvironment): PrismaClient {
  const log: ('warn' | 'error')[] = nodeEnv === 'development' ? ['warn', 'error'] : ['error'];
  return new PrismaClient({ log });
}

/**
 * Cliente Prisma singleton por processo (evita explosão de conexões em dev com hot reload).
 * Não exportar {@link PrismaClient} fora de `infrastructure`.
 */
export function getPrismaClient(nodeEnv: NodeEnvironment): PrismaClient {
  const existing = globalForPrisma.__medcof_prisma__;
  const prevEnv = globalForPrisma.__medcof_prisma_node_env__;
  if (existing !== undefined && prevEnv === nodeEnv) {
    return existing;
  }
  if (existing !== undefined) {
    void existing.$disconnect();
  }
  const client = newPrismaClient(nodeEnv);
  globalForPrisma.__medcof_prisma__ = client;
  globalForPrisma.__medcof_prisma_node_env__ = nodeEnv;
  return client;
}

export async function disconnectPrisma(): Promise<void> {
  const client = globalForPrisma.__medcof_prisma__;
  if (client !== undefined) {
    await client.$disconnect();
    delete globalForPrisma.__medcof_prisma__;
    delete globalForPrisma.__medcof_prisma_node_env__;
  }
}
