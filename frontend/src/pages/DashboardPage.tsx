import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { useAuthStore } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import type { Task } from '@/types/task.types';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyTasksState } from '@/components/tasks/EmptyTasksState';
import { ErrorBanner } from '@/components/tasks/ErrorBanner';
import { TaskFiltersBar } from '@/components/tasks/TaskFiltersBar';
import { TaskFormModal, type TaskFormMode } from '@/components/tasks/TaskFormModal';
import { TaskPagination } from '@/components/tasks/TaskPagination';
import { TaskTable } from '@/components/tasks/TaskTable';

function DashboardContent(): ReactElement {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const tasks = useTasks();

  const [searchDraft, setSearchDraft] = useState(() => tasks.params.search ?? '');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<TaskFormMode>('create');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    setSearchDraft(tasks.params.search ?? '');
  }, [tasks.params.search]);

  const openCreate = (): void => {
    setModalMode('create');
    setSelectedTask(null);
    setModalOpen(true);
  };

  const openEdit = (task: Task): void => {
    setModalMode('edit');
    setSelectedTask(task);
    setModalOpen(true);
  };

  const closeModal = (): void => {
    setModalOpen(false);
    setSelectedTask(null);
  };

  const onDelete = useCallback(
    (task: Task) => {
      const ok = window.confirm(`Delete task "${task.title}"?`);
      if (!ok) {
        return;
      }
      void tasks.deleteTask(task.id).catch(() => undefined);
    },
    [tasks],
  );

  const applySearch = (): void => {
    const trimmed = searchDraft.trim();
    tasks.setParams({ search: trimmed === '' ? undefined : trimmed });
  };

  const showEmptyList = tasks.status === 'success' && tasks.data !== null && tasks.data.tasks.length === 0;

  return (
    <>
      <PageShell
        title="Tasks"
        actions={
          <div className="page__toolbar">
            <span className="muted">{user?.email}</span>
            <Button type="button" variant="secondary" onClick={openCreate}>
              New task
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                logout();
              }}
            >
              Sign out
            </Button>
          </div>
        }
      >
        <TaskFiltersBar
          searchDraft={searchDraft}
          onSearchDraftChange={setSearchDraft}
          onApplySearch={applySearch}
          params={tasks.params}
          onParamsChange={tasks.setParams}
        />

        {tasks.status === 'loading' ? <Spinner label="Loading tasks" /> : null}
        {tasks.status === 'error' ? (
          <ErrorBanner
            message={tasks.error ?? 'Failed to load'}
            onRetry={() => {
              void tasks.refetch();
            }}
          />
        ) : null}

        {tasks.status === 'success' && tasks.data !== null ? (
          <>
            {showEmptyList ? <EmptyTasksState /> : null}
            {!showEmptyList ? <TaskTable tasks={tasks.data.tasks} onEdit={openEdit} onDelete={onDelete} /> : null}
            <TaskPagination
              meta={tasks.data.meta}
              onPageChange={(p) => {
                tasks.setParams({ page: p });
              }}
            />
          </>
        ) : null}
      </PageShell>

      <TaskFormModal
        open={modalOpen}
        mode={modalMode}
        task={selectedTask}
        onClose={closeModal}
        onCreate={async (input) => {
          await tasks.createTask(input);
        }}
        onUpdate={async (taskId, patch) => {
          await tasks.updateTask(taskId, patch);
        }}
      />
    </>
  );
}

export function DashboardPage(): ReactElement {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
