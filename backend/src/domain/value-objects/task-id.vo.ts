import { InvalidTaskIdError } from '../errors/invalid-task-id.error.js';

const MAX_LENGTH = 128;

export class TaskId {
  private constructor(public readonly value: string) {}

  static create(raw: string): TaskId {
    const trimmed = raw.trim();
    if (trimmed.length === 0 || trimmed.length > MAX_LENGTH) {
      throw new InvalidTaskIdError('Task id must be between 1 and 128 characters');
    }
    return new TaskId(trimmed);
  }

  equals(other: TaskId): boolean {
    return this.value === other.value;
  }
}
