import type { NextFunction, Request, Response, RequestHandler } from 'express';
import { appConfig, Environment } from '@shared/config/index.js';
import type { LoggerPort } from '@shared/logging/logger.port.js';

function mutationAuditPayload(req: Request): Record<string, unknown> | null {
  const method = req.method;
  if (method !== 'POST' && method !== 'PATCH' && method !== 'DELETE') {
    return null;
  }
  const routePath = req.baseUrl + req.path;
  if (routePath.startsWith('/tasks')) {
    return { event: 'audit_mutation_success', category: 'tasks', method, routePath };
  }
  if (routePath === '/auth/register') {
    return { event: 'audit_mutation_success', category: 'auth_register', method, routePath };
  }
  return null;
}

export interface RequestLoggingMiddlewareOptions {
  readonly logger: LoggerPort;
}

/**
 * Correlation + performance: duração total da requisição (até `finish`).
 * Não registra corpo nem query string (evita vazamento e ruído).
 * Em mutações bem-sucedidas, emite linha de auditoria (sem PII) com `requestId` correlacionável.
 */
export function createRequestLoggingMiddleware(options: RequestLoggingMiddlewareOptions): RequestHandler {
  const root = options.logger.child({ component: 'http' });
  return (req: Request, res: Response, next: NextFunction): void => {
    const requestId = typeof req.requestId === 'string' && req.requestId.length > 0 ? req.requestId : 'unknown';
    const reqLogger = root.child({ requestId });
    req.logger = reqLogger;

    const started = process.hrtime.bigint();
    if (!Environment.isProduction(appConfig.nodeEnv)) {
      root.debug('Incoming request', {
        event: 'http_request_start',
        requestId,
        method: req.method,
        path: req.path,
      });
    }

    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - started) / 1_000_000;
      const payload = {
        event: 'http_request_complete',
        requestId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs: Math.round(durationMs * 1000) / 1000,
      };
      if (res.statusCode >= 500) {
        root.error('Request completed with server error', payload);
      } else if (res.statusCode >= 400) {
        root.warn('Request completed with client error', payload);
      } else {
        root.info('Request completed', payload);
      }

      if (res.statusCode < 400) {
        const audit = mutationAuditPayload(req);
        if (audit !== null) {
          const userId = req.user?.id;
          root.info('Audit trail', {
            ...audit,
            requestId,
            ...(userId !== undefined ? { userId } : {}),
          });
        }
      }
    });

    next();
  };
}
