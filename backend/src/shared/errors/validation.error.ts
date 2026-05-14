import { AppError } from './app.error.js';

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', cause?: Error) {
    if (cause === undefined) {
      super(message, { code: 'VALIDATION_ERROR', statusCode: 400 });
    } else {
      super(message, { code: 'VALIDATION_ERROR', statusCode: 400, cause });
    }
    this.name = 'ValidationError';
  }
}
