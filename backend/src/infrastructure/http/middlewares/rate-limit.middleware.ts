import type { NextFunction, Request, RequestHandler, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { buildErrorBody } from '@shared/http/api-response.builders.js';
import type { GlobalRateLimitConfig, LoginRateLimitConfig } from '@shared/config/security-http.config.js';

function sendRateLimitExceeded(res: Response, message: string): void {
  res.status(429).json(buildErrorBody('RATE_LIMIT_EXCEEDED', message));
}

export function createGlobalRateLimiter(config: GlobalRateLimitConfig): RequestHandler {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === '/health' || req.path.startsWith('/health'),
    handler: (_req: Request, res: Response, _next: NextFunction) => {
      sendRateLimitExceeded(res, 'Too many requests from this IP, please try again later.');
    },
  });
}

export function createLoginRateLimiter(config: LoginRateLimitConfig): RequestHandler {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req: Request, res: Response, _next: NextFunction) => {
      sendRateLimitExceeded(res, 'Too many login attempts, please try again later.');
    },
  });
}
