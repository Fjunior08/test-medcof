import { describe, expect, it } from '@jest/globals';
import { Task } from '@domain/entities/task.entity.js';
import { TaskStatus } from '@domain/enums/task-status.enum.js';
import { InvalidTaskStatusTransitionError } from '@domain/errors/invalid-task-status-transition.error.js';
import { TaskAccessDeniedError } from '@domain/errors/task-access-denied.error.js';
import { TaskDescription } from '@domain/value-objects/task-description.vo.js';
import { TaskId } from '@domain/value-objects/task-id.vo.js';
import { TaskTitle } from '@domain/value-objects/task-title.vo.js';
import { UserId } from '@domain/value-objects/user-id.vo.js';

describe('Task (domain entity)', () => {
  const fixed = new Date('2020-01-01T00:00:00.000Z');
  const clock = (): Date => fixed;

  const owner = UserId.create('owner-1');
  const other = UserId.create('other-1');

  const newTask = (): Task =>
    Task.create({
      id: TaskId.create('task-1'),
      title: TaskTitle.create('My task'),
      ownerId: owner,
      description: TaskDescription.optional('  notes  '),
      clock,
    });

  it('starts as PENDING with timestamps', () => {
    // Act
    const task = newTask();

    // Assert
    expect(task.status).toBe(TaskStatus.PENDING);
    expect(task.createdAt.toISOString()).toBe(fixed.toISOString());
    expect(task.updatedAt.toISOString()).toBe(fixed.toISOString());
    expect(task.description?.value).toBe('notes');
  });

  it('denies mutations for non-owner', () => {
    // Arrange
    const task = newTask();

    // Act + Assert
    expect(() => {
      task.startProgress(other);
    }).toThrow(TaskAccessDeniedError);
  });

  it('follows status workflow', () => {
    // Arrange
    const task = newTask();

    // Act
    task.startProgress(owner, clock);
    expect(task.status).toBe(TaskStatus.IN_PROGRESS);
    task.pauseProgress(owner, clock);
    expect(task.status).toBe(TaskStatus.PENDING);
    task.startProgress(owner, clock);
    task.complete(owner, clock);
    expect(task.status).toBe(TaskStatus.DONE);
    task.reopen(owner, clock);

    // Assert
    expect(task.status).toBe(TaskStatus.PENDING);
  });

  it('rejects invalid transitions from DONE for start/pause', () => {
    // Arrange
    const task = newTask();
    task.complete(owner);

    // Act + Assert
    expect(() => {
      task.startProgress(owner);
    }).toThrow(InvalidTaskStatusTransitionError);
    expect(() => {
      task.pauseProgress(owner);
    }).toThrow(InvalidTaskStatusTransitionError);
  });

  it('rejects starting progress when not pending', () => {
    // Arrange
    const task = newTask();
    task.startProgress(owner);

    // Act + Assert
    expect(() => {
      task.startProgress(owner);
    }).toThrow(InvalidTaskStatusTransitionError);
  });
});
