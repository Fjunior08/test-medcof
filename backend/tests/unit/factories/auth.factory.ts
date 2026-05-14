import type { AuthenticatedUser } from '@shared/types/authenticated-user.js';

export function buildAuthenticatedUser(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  return {
    id: 'user-default-id',
    email: 'user@example.com',
    ...overrides,
  };
}

export function bearerAuthorizationHeader(token: string): { authorization: string } {
  return { authorization: `Bearer ${token}` };
}
