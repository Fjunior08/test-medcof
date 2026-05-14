import type { ReactElement } from 'react';
import type { Task } from '@/types/task.types';
import { Button } from '@/components/ui/Button';

export interface TaskTableProps {
  readonly tasks: readonly Task[];
  readonly onEdit: (task: Task) => void;
  readonly onDelete: (task: Task) => void;
}

export function TaskTable({ tasks, onEdit, onDelete }: TaskTableProps): ReactElement {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Updated</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>
                <div className="table__title">{task.title}</div>
                {task.description !== null && task.description.length > 0 ? (
                  <div className="table__muted">{task.description.slice(0, 120)}</div>
                ) : null}
              </td>
              <td>
                <span className="badge">{task.status}</span>
              </td>
              <td className="table__muted">{new Date(task.updatedAt).toLocaleString()}</td>
              <td className="table__actions">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    onEdit(task);
                  }}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => {
                    onDelete(task);
                  }}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
