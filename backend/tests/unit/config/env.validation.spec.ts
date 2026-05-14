import { describe, expect, it, jest } from '@jest/globals';
import { loadValidatedEnv } from '@shared/config/env.validation.js';

describe('loadValidatedEnv', () => {
  it('throws when mandatory variables are missing (fail fast)', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation((): void => {
      /* silence expected validation logs */
    });
    expect(() =>
      loadValidatedEnv({
        NODE_ENV: 'test',
      }),
    ).toThrow('Environment validation failed');
    spy.mockRestore();
  });

  it('accepts a complete valid snapshot', () => {
    const env = loadValidatedEnv({
      NODE_ENV: 'test',
      PORT: '3100',
      DATABASE_URL: 'mysql://user:pass@127.0.0.1:3306/db',
      JWT_SECRET: '01234567890123456789012345678901',
      JWT_EXPIRES_IN_SECONDS: '3600',
      BCRYPT_ROUNDS: '4',
    });
    expect(env.DATABASE_URL).toContain('mysql://');
    expect(env.JWT_SECRET).toHaveLength(32);
  });
});
