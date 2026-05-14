import { InvalidTaskTitleError } from '../errors/invalid-task-title.error.js';

const MIN_LENGTH = 1;
const MAX_LENGTH = 255;

export class TaskTitle {
  private constructor(public readonly value: string) {}

  static create(raw: string): TaskTitle {
    const trimmed = raw.trim();
    if (trimmed.length < MIN_LENGTH || trimmed.length > MAX_LENGTH) {
      throw new InvalidTaskTitleError(
        `Task title must be between ${String(MIN_LENGTH)} and ${String(MAX_LENGTH)} characters`,
      );
    }
    return new TaskTitle(trimmed);
  }
}
