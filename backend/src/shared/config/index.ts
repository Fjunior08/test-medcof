import { buildAppConfig } from './app.config.js';
import { loadValidatedEnv } from './env.validation.js';

export type { AppConfig, HttpSecurityEnvConfig, ServerConfig } from './app.config.js';
export type { AuthConfig } from './auth.config.js';
export type { DatabaseConfig } from './database.config.js';
export type { NodeEnvironment, ValidatedEnv } from './env.schema.js';
export { rawEnvSchema, databaseEnvSchema, authEnvSchema, appRuntimeEnvSchema } from './env.schema.js';
export { loadValidatedEnv } from './env.validation.js';
export { Environment } from './environment.js';
export { buildSecurityHttpConfig, type SecurityHttpConfig } from './security-http.config.js';

const validatedEnv = loadValidatedEnv();

/**
 * Configuração global validada. Importar este módulo dispara validação (fail fast no boot).
 */
export const appConfig = buildAppConfig(validatedEnv);
