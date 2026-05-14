import { InvalidTaskDescriptionError } from '../errors/invalid-task-description.error.js';

const MAX_LENGTH = 10_000;

export class TaskDescription {
  private constructor(public readonly value: string) {}

  /**
   * Creates a description from non-empty input (after trim).
   */
  static create(raw: string): TaskDescription {
    const trimmed = raw.trim();
    if (trimmed.length === 0) {
      throw new InvalidTaskDescriptionError('Task description cannot be empty when provided');
    }
    if (trimmed.length > MAX_LENGTH) {
      throw new InvalidTaskDescriptionError(
        `Task description cannot exceed ${String(MAX_LENGTH)} characters`,
      );
    }
    return new TaskDescription(trimmed);
  }

  /**
   * Optional description: undefined / whitespace-only becomes undefined.
   */
  static optional(raw?: string): TaskDescription | undefined {
    if (raw === undefined) {
      return undefined;
    }
    const trimmed = raw.trim();
    if (trimmed.length === 0) {
      return undefined;
    }
    return TaskDescription.create(trimmed);
  }
}
