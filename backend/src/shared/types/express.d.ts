import type { AuthenticatedUser } from './authenticated-user.js';
import type { LoggerPort } from '../logging/logger.port.js';

export {};

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthenticatedUser | undefined;
    /** Correlation id set by `requestContextMiddleware` (also echoed as `x-request-id`). */
    requestId?: string | undefined;
    /** Logger filho com `requestId` — definido por `createRequestLoggingMiddleware`. */
    logger?: LoggerPort;
  }
}
