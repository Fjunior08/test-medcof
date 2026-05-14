import type { NextFunction, Request, Response, RequestHandler } from 'express';
import type { JwtTokenServicePort } from '@application/ports/jwt-token-service.port.js';
import type { LoggerPort } from '@shared/logging/logger.port.js';
import { UnauthorizedError } from '@shared/errors/unauthorized.error.js';

export function createAuthenticateMiddleware(
  tokens: JwtTokenServicePort,
  rootLogger: LoggerPort,
): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const log = (req.logger ?? rootLogger).child({
      component: 'auth',
      requestId: typeof req.requestId === 'string' ? req.requestId : 'unknown',
    });

    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      log.warn('JWT authentication failed', { reason: 'missing_or_invalid_scheme', path: req.path });
      next(new UnauthorizedError());
      return;
    }

    const raw = header.slice('Bearer '.length).trim();
    if (raw.length === 0) {
      log.warn('JWT authentication failed', { reason: 'empty_bearer_token', path: req.path });
      next(new UnauthorizedError());
      return;
    }

    try {
      const claims = await tokens.verifyAccessToken(raw);
      req.user = { id: claims.sub, email: claims.email };
      log.debug('JWT authentication succeeded', {
        event: 'auth_jwt_validated',
        userId: claims.sub,
        path: req.path,
      });
      next();
    } catch (error) {
      log.warn('JWT authentication failed', {
        reason: 'invalid_or_expired_token',
        path: req.path,
        errorName: error instanceof Error ? error.name : 'Unknown',
      });
      next(error instanceof UnauthorizedError ? error : new UnauthorizedError());
    }
  };
}
