import type { ApiErrorBody } from './api-error.types.js';
import type { ApiSuccessBody, ApiSuccessMetadata, PaginationMeta } from './api-success.types.js';

export function buildSuccessBody(data: unknown, metadata?: ApiSuccessMetadata): ApiSuccessBody {
  if (metadata === undefined) {
    return { success: true, data };
  }
  return { success: true, data, metadata };
}

export function buildErrorBody(code: string, message: string): ApiErrorBody {
  return { success: false, error: { code, message } };
}

/**
 * Metadados de paginação coerentes (totalPages ≥ 1, pageSize ≥ 1).
 */
export function computePaginationMeta(input: {
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
}): PaginationMeta {
  const pageSize = Math.max(1, input.pageSize);
  const totalItems = Math.max(0, input.totalItems);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.min(Math.max(1, input.page), totalPages);
  return { page, pageSize, totalItems, totalPages };
}
