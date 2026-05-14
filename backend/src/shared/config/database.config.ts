import type { ValidatedEnv } from './env.schema.js';

export interface DatabaseConfig {
  readonly url: string;
}

export function buildDatabaseConfig(env: ValidatedEnv): DatabaseConfig {
  return {
    url: env.DATABASE_URL,
  };
}
