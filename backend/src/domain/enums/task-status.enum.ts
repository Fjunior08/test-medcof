export const TaskStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const;

export type TaskStatusValue = (typeof TaskStatus)[keyof typeof TaskStatus];

export function isTaskStatus(value: string): value is TaskStatusValue {
  return (
    value === TaskStatus.PENDING ||
    value === TaskStatus.IN_PROGRESS ||
    value === TaskStatus.DONE
  );
}
