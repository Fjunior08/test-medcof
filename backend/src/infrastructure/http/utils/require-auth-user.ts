import type { Request } from 'express';
import type { AuthenticatedUser } from '@shared/types/authenticated-user.js';
import { UnauthorizedError } from '@shared/errors/unauthorized.error.js';

export function requireAuthUser(req: Request): AuthenticatedUser {
  if (req.user === undefined) {
    throw new UnauthorizedError();
  }
  return req.user;
}
