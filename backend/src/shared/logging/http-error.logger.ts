import type { Request } from 'express';
import { appConfig, Environment } from '@shared/config/index.js';
import type { LoggerPort } from './logger.port.js';

export type HttpErrorLogLevel = 'error' | 'warn';

export interface LoggedHttpErrorContext {
  readonly level: HttpErrorLogLevel;
  readonly requestId: string;
  readonly method: string;
  readonly path: string;
  readonly httpStatus: number;
  readonly errorCode: string;
  readonly message: string;
  readonly errorName: string;
  readonly isOperational: boolean;
  readonly stack?: string | undefined;
  readonly context?: Record<string, unknown> | undefined;
}

function pickLogLevel(httpStatus: number, isOperational: boolean): HttpErrorLogLevel {
  if (httpStatus >= 500) {
    return 'error';
  }
  if (httpStatus >= 400 && isOperational) {
    return 'warn';
  }
  return 'error';
}

function shouldAttachStack(httpStatus: number): boolean {
  if (httpStatus >= 500) {
    return true;
  }
  return !Environment.isProduction(appConfig.nodeEnv);
}

export function buildHttpErrorLogContext(input: {
  readonly req: Request;
  readonly httpStatus: number;
  readonly errorCode: string;
  readonly message: string;
  readonly logMessage?: string | undefined;
  readonly err: unknown;
  readonly isOperational: boolean;
  readonly extra?: Record<string, unknown> | undefined;
}): LoggedHttpErrorContext {
  const requestId =
    typeof input.req.requestId === 'string' && input.req.requestId.length > 0 ? input.req.requestId : 'unknown';
  const baseError = input.err instanceof Error ? input.err : undefined;
  const stack = shouldAttachStack(input.httpStatus) ? baseError?.stack : undefined;
  const level = pickLogLevel(input.httpStatus, input.isOperational);
  const messageForLog = input.logMessage ?? input.message;
  return {
    level,
    requestId,
    method: input.req.method,
    path: input.req.path,
    httpStatus: input.httpStatus,
    errorCode: input.errorCode,
    message: messageForLog,
    errorName: baseError?.name ?? 'UnknownError',
    isOperational: input.isOperational,
    ...(stack !== undefined ? { stack } : {}),
    ...(input.extra !== undefined ? { context: input.extra } : {}),
  };
}

export function logHttpErrorWithLogger(logger: LoggerPort, ctx: LoggedHttpErrorContext): void {
  const payload = {
    kind: 'http_error',
    requestId: ctx.requestId,
    method: ctx.method,
    path: ctx.path,
    httpStatus: ctx.httpStatus,
    errorCode: ctx.errorCode,
    message: ctx.message,
    errorName: ctx.errorName,
    isOperational: ctx.isOperational,
    ...(ctx.stack !== undefined ? { stack: ctx.stack } : {}),
    ...(ctx.context !== undefined ? { context: ctx.context } : {}),
  };
  if (ctx.level === 'error') {
    logger.error('HTTP error response', payload);
    return;
  }
  logger.warn('HTTP error response', payload);
}
