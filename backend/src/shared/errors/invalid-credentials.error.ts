import { AppError } from './app.error.js';

export class InvalidCredentialsError extends AppError {
  constructor() {
    super('Invalid email or password', {
      code: 'INVALID_CREDENTIALS',
      statusCode: 401,
    });
    this.name = 'InvalidCredentialsError';
  }
}
