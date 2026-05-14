import type { ReactElement } from 'react';

export function EmptyTasksState(): ReactElement {
  return (
    <div className="empty-state">
      <p className="empty-state__title">No tasks yet</p>
      <p className="empty-state__hint">Create a task to get started.</p>
    </div>
  );
}
