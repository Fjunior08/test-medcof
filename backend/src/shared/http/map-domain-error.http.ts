import type { DomainError } from '@domain/errors/domain.error.js';

const DOMAIN_ERROR_HTTP: Readonly<Record<string, { readonly statusCode: number; readonly code: string }>> = {
  TASK_ACCESS_DENIED: { statusCode: 403, code: 'TASK_ACCESS_DENIED' },
  INVALID_TASK_STATUS_TRANSITION: { statusCode: 409, code: 'INVALID_TASK_STATUS_TRANSITION' },
  INVALID_EMAIL: { statusCode: 400, code: 'INVALID_EMAIL' },
  INVALID_USER_ID: { statusCode: 400, code: 'INVALID_USER_ID' },
  INVALID_TASK_ID: { statusCode: 400, code: 'INVALID_TASK_ID' },
  INVALID_TASK_TITLE: { statusCode: 400, code: 'INVALID_TASK_TITLE' },
  INVALID_TASK_DESCRIPTION: { statusCode: 400, code: 'INVALID_TASK_DESCRIPTION' },
  INVALID_PASSWORD_HASH: { statusCode: 400, code: 'INVALID_PASSWORD_HASH' },
};

/**
 * Domínio → HTTP: tabela explícita. Código desconhecido: 400 + code original (comportamento conservador).
 */
export function mapDomainErrorToHttp(err: DomainError): { readonly statusCode: number; readonly code: string } {
  const mapped = DOMAIN_ERROR_HTTP[err.code];
  if (mapped !== undefined) {
    return mapped;
  }
  return { statusCode: 400, code: err.code };
}
