/**
 * Envelope alinhado ao backend (`buildSuccessBody` / erros HTTP).
 */
export interface ApiSuccessEnvelope<TData> {
  readonly success: true;
  readonly data: TData;
  readonly metadata?: ApiSuccessMetadata | undefined;
}

export type ApiSuccessMetadata = Readonly<Record<string, unknown>>;

export interface ApiErrorEnvelope {
  readonly success: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
  };
}

export function isApiErrorEnvelope(value: unknown): value is ApiErrorEnvelope {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const v = value as { success?: unknown; error?: unknown };
  return (
    v.success === false &&
    typeof v.error === 'object' &&
    v.error !== null &&
    'code' in v.error &&
    'message' in v.error
  );
}
