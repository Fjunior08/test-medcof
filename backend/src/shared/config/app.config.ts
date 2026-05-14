import type { NodeEnvironment, ValidatedEnv } from './env.schema.js';
import { buildAuthConfig, type AuthConfig } from './auth.config.js';
import { buildDatabaseConfig, type DatabaseConfig } from './database.config.js';

export interface ServerConfig {
  readonly port: number;
  readonly trustProxy: boolean;
}

/** Limites e políticas HTTP derivados de variáveis de ambiente. */
export interface HttpSecurityEnvConfig {
  readonly corsOrigins: string | undefined;
  readonly jsonBodyLimit: string;
  readonly rateLimitWindowMs: number;
  readonly rateLimitMax: number;
  readonly loginRateLimitWindowMs: number;
  readonly loginRateLimitMax: number;
}

/**
 * Configuração tipada da aplicação: único objeto consumido pelo restante do código.
 * Montado a partir de {@link ValidatedEnv} (Zod).
 */
export interface AppConfig {
  readonly nodeEnv: NodeEnvironment;
  readonly server: ServerConfig;
  readonly database: DatabaseConfig;
  readonly auth: AuthConfig;
  readonly httpSecurity: HttpSecurityEnvConfig;
}

export function buildAppConfig(env: ValidatedEnv): AppConfig {
  return {
    nodeEnv: env.NODE_ENV,
    server: {
      port: env.PORT,
      trustProxy: env.TRUST_PROXY,
    },
    database: buildDatabaseConfig(env),
    auth: buildAuthConfig(env),
    httpSecurity: {
      corsOrigins: env.CORS_ORIGINS,
      jsonBodyLimit: env.JSON_BODY_LIMIT,
      rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
      rateLimitMax: env.RATE_LIMIT_MAX,
      loginRateLimitWindowMs: env.LOGIN_RATE_LIMIT_WINDOW_MS,
      loginRateLimitMax: env.LOGIN_RATE_LIMIT_MAX,
    },
  };
}
