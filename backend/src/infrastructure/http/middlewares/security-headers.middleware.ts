import type { RequestHandler } from 'express';
import helmet from 'helmet';
import type { HelmetOptions } from 'helmet';

export function createSecurityHeadersMiddleware(options: HelmetOptions): RequestHandler {
  return helmet(options);
}
