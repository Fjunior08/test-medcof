import type { RequestHandler } from 'express';

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function sanitizeDeep(value: unknown): unknown {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (value instanceof Date) {
    return new Date(value.getTime());
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeDeep);
  }
  const input = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(input)) {
    if (DANGEROUS_KEYS.has(key)) {
      continue;
    }
    out[key] = sanitizeDeep(child);
  }
  return out;
}

/** Exportado para testes unitários do saneador recursivo. */
export function sanitizeParsedJsonBody(value: unknown): unknown {
  return sanitizeDeep(value);
}

/**
 * Remove chaves perigosas do corpo JSON (mitigação de prototype pollution).
 * Executar após `express.json()`.
 */
export function createSanitizeRequestBodyMiddleware(): RequestHandler {
  return (req, _res, next) => {
    if (req.body !== undefined && req.body !== null && typeof req.body === 'object') {
      req.body = sanitizeParsedJsonBody(req.body);
    }
    next();
  };
}
