import { InvalidEmailError } from '../errors/invalid-email.error.js';

const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const MAX_LENGTH = 320;

export class Email {
  private constructor(public readonly value: string) {}

  static create(raw: string): Email {
    const normalized = raw.trim().toLowerCase();
    if (normalized.length === 0 || normalized.length > MAX_LENGTH) {
      throw new InvalidEmailError('Email must be between 1 and 320 characters');
    }
    if (!EMAIL_PATTERN.test(normalized)) {
      throw new InvalidEmailError('Email format is invalid');
    }
    return new Email(normalized);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
