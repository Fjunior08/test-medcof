import type { ValidatedEnv } from './env.schema.js';

export interface AuthConfig {
  readonly jwtSecret: string;
  readonly jwtExpiresInSeconds: number;
  readonly jwtIssuer: string | undefined;
  readonly jwtAudience: string | undefined;
  readonly bcryptRounds: number;
}

export function buildAuthConfig(env: ValidatedEnv): AuthConfig {
  return {
    jwtSecret: env.JWT_SECRET,
    jwtExpiresInSeconds: env.JWT_EXPIRES_IN_SECONDS,
    jwtIssuer: env.JWT_ISSUER,
    jwtAudience: env.JWT_AUDIENCE,
    bcryptRounds: env.BCRYPT_ROUNDS,
  };
}
