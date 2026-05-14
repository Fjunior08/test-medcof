import { DomainError } from './domain.error.js';

export class InvalidPasswordHashError extends DomainError {
  readonly code = 'INVALID_PASSWORD_HASH';

  constructor(message = 'Stored password hash is invalid') {
    super(message);
  }
}
