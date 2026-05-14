import { DomainError } from './domain.error.js';

export class InvalidUserIdError extends DomainError {
  readonly code = 'INVALID_USER_ID';

  constructor(message = 'User id is invalid') {
    super(message);
  }
}
