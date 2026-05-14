/**
 * Metadados opcionais no envelope de sucesso (paginação, ETags, hints de cache, etc.).
 * Mantido como record para evolução sem quebrar contratos antigos.
 */
export type ApiSuccessMetadata = Readonly<Record<string, unknown>>;

export interface ApiSuccessBody {
  readonly success: true;
  readonly data: unknown;
  readonly metadata?: ApiSuccessMetadata;
}

export interface PaginationMeta {
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly totalPages: number;
}
