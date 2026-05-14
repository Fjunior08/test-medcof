import type { CorsOptions } from 'cors';
import type { HelmetOptions } from 'helmet';
import type { AppConfig } from './app.config.js';

export interface GlobalRateLimitConfig {
  readonly windowMs: number;
  readonly max: number;
}

export interface LoginRateLimitConfig {
  readonly windowMs: number;
  readonly max: number;
}

/**
 * Opções HTTP de segurança derivadas de {@link AppConfig}.
 */
export interface SecurityHttpConfig {
  readonly trustProxy: boolean;
  readonly jsonBodyLimit: string;
  readonly helmet: HelmetOptions;
  readonly cors: CorsOptions;
  readonly globalRateLimit: GlobalRateLimitConfig;
  readonly loginRateLimit: LoginRateLimitConfig;
}

function buildCorsOptions(config: AppConfig): CorsOptions {
  const raw = config.httpSecurity.corsOrigins?.trim();
  if (raw === undefined || raw === '') {
    return { origin: true };
  }
  if (raw === '*') {
    return { origin: true };
  }
  const origins = raw.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
  return { origin: origins.length === 0 ? true : origins };
}

function buildHelmetOptions(): HelmetOptions {
  return {
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  };
}

export function buildSecurityHttpConfig(config: AppConfig): SecurityHttpConfig {
  return {
    trustProxy: config.server.trustProxy,
    jsonBodyLimit: config.httpSecurity.jsonBodyLimit,
    helmet: buildHelmetOptions(),
    cors: buildCorsOptions(config),
    globalRateLimit: {
      windowMs: config.httpSecurity.rateLimitWindowMs,
      max: config.httpSecurity.rateLimitMax,
    },
    loginRateLimit: {
      windowMs: config.httpSecurity.loginRateLimitWindowMs,
      max: config.httpSecurity.loginRateLimitMax,
    },
  };
}
