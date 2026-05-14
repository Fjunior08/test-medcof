/**
 * Canonical HTTP error envelope for this API (no stack, no internal details).
 */
export interface ApiStandardErrorBody {
  readonly success: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
  };
}

export type ApiErrorBody = ApiStandardErrorBody;
