import { InvalidPasswordHashError } from '../errors/invalid-password-hash.error.js';

/** Bcrypt hashes are 60 chars ($2a/$2b/$2y prefix). */
const MIN_LENGTH = 50;
const MAX_LENGTH = 255;

export class PasswordHash {
  private constructor(public readonly value: string) {}

  static create(value: string): PasswordHash {
    const trimmed = value.trim();
    if (trimmed.length < MIN_LENGTH || trimmed.length > MAX_LENGTH) {
      throw new InvalidPasswordHashError(
        `Password hash must be between ${String(MIN_LENGTH)} and ${String(MAX_LENGTH)} characters`,
      );
    }
    return new PasswordHash(trimmed);
  }
}
