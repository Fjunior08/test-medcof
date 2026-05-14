import { InvalidUserIdError } from '../errors/invalid-user-id.error.js';

const MAX_LENGTH = 128;

export class UserId {
  private constructor(public readonly value: string) {}

  static create(raw: string): UserId {
    const trimmed = raw.trim();
    if (trimmed.length === 0 || trimmed.length > MAX_LENGTH) {
      throw new InvalidUserIdError('User id must be between 1 and 128 characters');
    }
    return new UserId(trimmed);
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }
}
