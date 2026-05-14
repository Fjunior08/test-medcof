import { rawEnvSchema, type ValidatedEnv } from './env.schema.js';

/**
 * Valida `process.env` com Zod e falha imediatamente se obrigatórios estiverem inválidos ou ausentes.
 */
export function loadValidatedEnv(record: NodeJS.ProcessEnv = process.env): ValidatedEnv {
  const result = rawEnvSchema.safeParse(record);
  if (!result.success) {
    console.error('[config] Environment validation failed');
    console.error(result.error.flatten());
    throw new Error('Environment validation failed');
  }
  return result.data;
}
