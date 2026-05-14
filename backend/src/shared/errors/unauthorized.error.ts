import { AppError } from './app.error.js';

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, { code: 'UNAUTHORIZED', statusCode: 401 });
    this.name = 'UnauthorizedError';
  }
}
