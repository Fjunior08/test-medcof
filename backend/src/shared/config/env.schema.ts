import { z } from 'zod';

const emptyToUndefined = (value: unknown): unknown => {
  if (typeof value === 'string' && value.trim() === '') {
    return undefined;
  }
  return value;
};

function parseTrustProxyFlag(value: unknown): boolean {
  if (value === undefined || value === null || value === '') {
    return false;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  if (typeof value !== 'string') {
    return false;
  }
  const s = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(s)) {
    return true;
  }
  if (['0', 'false', 'no', 'off'].includes(s)) {
    return false;
  }
  return false;
}

/** Variáveis de persistência (obrigatórias em todos os ambientes). */
export const databaseEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
});

/** Autenticação e hashing de passwords. */
export const authEnvSchema = z.object({
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().max(31_536_000).default(86_400),
  JWT_ISSUER: z.preprocess(emptyToUndefined, z.string().min(1).max(128).optional()),
  JWT_AUDIENCE: z.preprocess(emptyToUndefined, z.string().min(1).max(128).optional()),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(12),
});

/** Runtime HTTP, segurança transversal e ambiente de processo. */
export const appRuntimeEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  TRUST_PROXY: z.preprocess(parseTrustProxyFlag, z.boolean()),
  CORS_ORIGINS: z.preprocess(emptyToUndefined, z.string().optional()),
  JSON_BODY_LIMIT: z.string().min(1).default('512kb'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  LOGIN_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
  LOGIN_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
});

export const rawEnvSchema = databaseEnvSchema
  .merge(authEnvSchema)
  .merge(appRuntimeEnvSchema)
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === 'production') {
      const cors = data.CORS_ORIGINS?.trim();
      if (cors === undefined || cors === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'CORS_ORIGINS is required in production (comma-separated origins, or * for allow-all)',
          path: ['CORS_ORIGINS'],
        });
      }
    }
  });

export type ValidatedEnv = z.infer<typeof rawEnvSchema>;

export type NodeEnvironment = ValidatedEnv['NODE_ENV'];
