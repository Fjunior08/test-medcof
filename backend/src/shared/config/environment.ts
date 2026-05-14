import type { NodeEnvironment } from './env.schema.js';

/** Predicados por ambiente (regras de deploy sem espalhar literais). */
export const Environment = {
  isProduction(env: NodeEnvironment): env is 'production' {
    return env === 'production';
  },
  isDevelopment(env: NodeEnvironment): env is 'development' {
    return env === 'development';
  },
  isTest(env: NodeEnvironment): env is 'test' {
    return env === 'test';
  },
} as const;
