import type { RequestHandler } from 'express';
import cors from 'cors';
import type { CorsOptions } from 'cors';

export function createCorsMiddleware(options: CorsOptions): RequestHandler {
  return cors(options);
}
