import type { Response } from 'express';
import type { ApiSuccessMetadata, PaginationMeta } from './api-success.types.js';
import { buildErrorBody, buildSuccessBody } from './api-response.builders.js';

export type { ApiSuccessBody, ApiSuccessMetadata, PaginationMeta } from './api-success.types.js';
export type { ApiErrorBody } from './api-error.types.js';
export { buildSuccessBody, buildErrorBody, computePaginationMeta } from './api-response.builders.js';

/**
 * Resposta de sucesso padronizada. Use `metadata` para paginação ou outros metadados transversais.
 */
export function sendSuccess(
  res: Response,
  statusCode: number,
  data: unknown,
  metadata?: ApiSuccessMetadata,
): void {
  res.status(statusCode).json(buildSuccessBody(data, metadata));
}

/**
 * Lista paginada: `data.items` + `metadata.pagination` (padrão REST comum).
 */
export function sendPaginatedSuccess(
  res: Response,
  statusCode: number,
  items: readonly unknown[],
  pagination: PaginationMeta,
): void {
  sendSuccess(res, statusCode, { items: [...items] }, { pagination });
}

export function sendError(res: Response, statusCode: number, code: string, message: string): void {
  res.status(statusCode).json(buildErrorBody(code, message));
}

/**
 * Ponto de entrada único para respostas HTTP (sucesso, paginação, erro manual em fluxos especiais).
 */
export const ApiResponse = {
  success: sendSuccess,
  paginated: sendPaginatedSuccess,
  error: sendError,
} as const;
