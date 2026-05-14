export interface AppErrorInit {
  readonly code: string;
  readonly statusCode: number;
  readonly cause?: Error | undefined;
  /**
   * Known, expected failures (4xx business rules). Used for log level / noise control.
   */
  readonly isOperational?: boolean | undefined;
}

/**
 * Base class for application and transport-aware errors mapped to HTTP by the global handler.
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, init: AppErrorInit) {
    const { code, statusCode, cause, isOperational } = init;
    super(message, cause !== undefined ? { cause } : undefined);
    this.name = new.target.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational ?? true;
  }
}
