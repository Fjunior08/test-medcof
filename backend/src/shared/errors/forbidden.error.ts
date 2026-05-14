import { AppError } from './app.error.js';

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', code = 'FORBIDDEN') {
    super(message, { code, statusCode: 403 });
    this.name = 'ForbiddenError';
  }
}
