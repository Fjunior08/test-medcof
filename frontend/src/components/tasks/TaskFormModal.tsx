import { useEffect, useState, type ReactElement } from 'react';
import type { Task, TaskStatus, UpdateTaskPayload } from '@/types/task.types';
import { TASK_STATUSES } from '@/types/task.types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, type SelectOption } from '@/components/ui/Select';

const statusEditOptions: readonly SelectOption<TaskStatus>[] = TASK_STATUSES.map((s) => ({
  value: s,
  label: s,
}));

export type TaskFormMode = 'create' | 'edit';

export interface TaskFormModalProps {
  readonly open: boolean;
  readonly mode: TaskFormMode;
  readonly task: Task | null;
  readonly onClose: () => void;
  readonly onCreate: (input: { readonly title: string; readonly description?: string | undefined }) => Promise<void>;
  readonly onUpdate: (taskId: string, patch: UpdateTaskPayload) => Promise<void>;
}

export function TaskFormModal({
  open,
  mode,
  task,
  onClose,
  onCreate,
  onUpdate,
}: TaskFormModalProps): ReactElement | null {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('PENDING');
  const [clearDescription, setClearDescription] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setLocalError(null);
    if (mode === 'edit' && task !== null) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setStatus(task.status);
      setClearDescription(false);
    }
    if (mode === 'create') {
      setTitle('');
      setDescription('');
      setStatus('PENDING');
      setClearDescription(false);
    }
  }, [open, mode, task]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: { preventDefault(): void }): Promise<void> {
    event.preventDefault();
    setLocalError(null);
    const trimmed = title.trim();
    if (trimmed.length === 0) {
      setLocalError('Title is required');
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'create') {
        await onCreate({
          title: trimmed,
          description: description.trim() === '' ? undefined : description.trim(),
        });
      } else if (task !== null) {
        const patch: UpdateTaskPayload = {
          title: trimmed,
          status,
        };
        if (clearDescription) {
          patch.clearDescription = true;
        } else if (description.trim() !== (task.description ?? '').trim()) {
          patch.description = description.trim() === '' ? undefined : description.trim();
        }
        await onUpdate(task.id, patch);
      }
      onClose();
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
        onClick={(ev) => {
          ev.stopPropagation();
        }}
      >
        <h2 id="task-form-title" className="modal__title">
          {mode === 'create' ? 'New task' : 'Edit task'}
        </h2>
        <form
          className="modal__form"
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
        >
          <Input
            id="task-title"
            label="Title"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
            }}
            required
          />
          <div className="field">
            <label className="field__label" htmlFor="task-description">
              Description
            </label>
            <textarea
              id="task-description"
              className="field__input field__textarea"
              rows={4}
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
              }}
              disabled={mode === 'edit' && clearDescription}
            />
          </div>
          {mode === 'edit' ? (
            <>
              <Select<TaskStatus>
                id="task-status-edit"
                label="Status"
                value={status}
                options={statusEditOptions}
                onChange={(event) => {
                  setStatus(event.target.value as TaskStatus);
                }}
              />
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={clearDescription}
                  onChange={(event) => {
                    setClearDescription(event.target.checked);
                  }}
                />
                Clear description
              </label>
            </>
          ) : null}
          {localError !== null ? <p className="form-error">{localError}</p> : null}
          <div className="modal__actions">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
