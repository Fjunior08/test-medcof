import type { NextFunction, Request, Response, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { DomainError } from '@domain/errors/domain.error.js';
import { AppError } from '@shared/errors/app.error.js';
import { appConfig, Environment } from '@shared/config/index.js';
import { mapPrismaClientError } from '@infrastructure/database/prisma-client-error.mapper.js';
import { buildErrorBody } from '@shared/http/api-response.builders.js';
import { mapDomainErrorToHttp } from '@shared/http/map-domain-error.http.js';
import type { LoggerPort } from '@shared/logging/logger.port.js';
import { buildHttpErrorLogContext, logHttpErrorWithLogger } from '@shared/logging/http-error.logger.js';

export function createGlobalErrorHandler(logger: LoggerPort): ErrorRequestHandler {
  const errorLogger = logger.child({ component: 'error-handler' });

  function sendStandardError(
    req: Request,
    res: Response,
    httpStatus: number,
    errorCode: string,
    publicMessage: string,
    err: unknown,
    isOperational: boolean,
    logExtra?: Record<string, unknown>,
    logMessage?: string,
  ): void {
    if (res.headersSent) {
      const fallback = buildHttpErrorLogContext({
        req,
        httpStatus,
        errorCode,
        message: publicMessage,
        ...(logMessage !== undefined ? { logMessage } : {}),
        err,
        isOperational,
        extra: { ...(logExtra ?? {}), droppedResponse: true },
      });
      logHttpErrorWithLogger(errorLogger, fallback);
      return;
    }
    const body = buildErrorBody(errorCode, publicMessage);
    const logCtx = buildHttpErrorLogContext({
      req,
      httpStatus,
      errorCode,
      message: publicMessage,
      ...(logMessage !== undefined ? { logMessage } : {}),
      err,
      isOperational,
      ...(logExtra !== undefined ? { extra: logExtra } : {}),
    });
    logHttpErrorWithLogger(errorLogger, logCtx);
    res.status(httpStatus).json(body);
  }

  return (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
    if (err instanceof AppError) {
      sendStandardError(req, res, err.statusCode, err.code, err.message, err, err.isOperational);
      return;
    }

    if (err instanceof DomainError) {
      const { statusCode, code } = mapDomainErrorToHttp(err);
      sendStandardError(req, res, statusCode, code, err.message, err, true);
      return;
    }

    if (err instanceof ZodError) {
      const logExtra =
        Environment.isProduction(appConfig.nodeEnv)
          ? { issueCount: err.issues.length }
          : { zod: err.flatten() };
      sendStandardError(req, res, 400, 'VALIDATION_ERROR', 'Validation failed', err, true, logExtra);
      return;
    }

    const prismaMapped = mapPrismaClientError(err);
    if (prismaMapped !== null) {
      sendStandardError(
        req,
        res,
        prismaMapped.statusCode,
        prismaMapped.code,
        prismaMapped.message,
        err,
        prismaMapped.isOperational,
        prismaMapped.logExtra,
      );
      return;
    }

    const internalMessage = err instanceof Error ? err.message : 'Internal server error';
    const publicMessage = Environment.isProduction(appConfig.nodeEnv)
      ? 'Internal server error'
      : internalMessage;
    sendStandardError(req, res, 500, 'INTERNAL_ERROR', publicMessage, err, false, undefined, internalMessage);
  };
}
