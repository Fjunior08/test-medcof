import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library.js';

export interface MappedHttpError {
  readonly statusCode: number;
  readonly code: string;
  readonly message: string;
  readonly isOperational: boolean;
  readonly logExtra?: Record<string, unknown>;
}

/**
 * Converte erros comuns do Prisma em respostas HTTP estáveis (sem vazar detalhes internos em produção).
 */
export function mapPrismaClientError(err: unknown): MappedHttpError | null {
  if (err instanceof PrismaClientValidationError) {
    return {
      statusCode: 400,
      code: 'PRISMA_VALIDATION_ERROR',
      message: 'Invalid data for persistence',
      isOperational: true,
    };
  }

  if (!(err instanceof PrismaClientKnownRequestError)) {
    return null;
  }

  switch (err.code) {
    case 'P1001':
    case 'P1002':
    case 'P1008':
    case 'P1017':
      return {
        statusCode: 503,
        code: 'DATABASE_UNAVAILABLE',
        message: 'Database is temporarily unavailable',
        isOperational: true,
        logExtra: { prismaCode: err.code },
      };
    case 'P2002': {
      const meta = err.meta;
      const targets =
        typeof meta === 'object' && 'target' in meta ? Reflect.get(meta, 'target') : undefined;
      const targetList = Array.isArray(targets) ? targets.join(',') : typeof targets === 'string' ? targets : '';
      const base = {
        statusCode: 409,
        code: 'UNIQUE_CONSTRAINT_VIOLATION',
        message: 'A record with this value already exists',
        isOperational: true as const,
      };
      if (targetList.length > 0) {
        return { ...base, logExtra: { constraintFields: targetList } };
      }
      return base;
    }
    case 'P2025':
      return {
        statusCode: 404,
        code: 'RECORD_NOT_FOUND',
        message: 'Record not found',
        isOperational: true,
      };
    case 'P2003':
      return {
        statusCode: 409,
        code: 'FOREIGN_KEY_CONSTRAINT',
        message: 'Related record constraint failed',
        isOperational: true,
      };
    default:
      return {
        statusCode: 500,
        code: 'DATABASE_ERROR',
        message: 'Database operation failed',
        isOperational: false,
        logExtra: { prismaCode: err.code },
      };
  }
}
