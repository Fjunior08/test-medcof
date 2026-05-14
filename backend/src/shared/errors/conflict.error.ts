import { AppError } from './app.error.js';

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, { code: 'CONFLICT', statusCode: 409 });
    this.name = 'ConflictError';
  }
}
