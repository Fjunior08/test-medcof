import { AppError } from './app.error.js';

export class NotImplementedError extends AppError {
  constructor(message = 'This operation is not implemented yet') {
    super(message, { code: 'NOT_IMPLEMENTED', statusCode: 501 });
    this.name = 'NotImplementedError';
  }
}
