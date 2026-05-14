import type { ReactElement } from 'react';
import type { ListTasksParams } from '@/types/task.types';
import { TASK_STATUSES, type TaskSortField, type SortOrder, type TaskStatus } from '@/types/task.types';
import { Input } from '@/components/ui/Input';
import { Select, type SelectOption } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

const statusOptions: readonly SelectOption<TaskStatus | ''>[] = [
  { value: '', label: 'All statuses' },
  ...TASK_STATUSES.map((s) => ({ value: s, label: s })),
];

const sortOptions: readonly SelectOption<TaskSortField>[] = [
  { value: 'updatedAt', label: 'Updated' },
  { value: 'createdAt', label: 'Created' },
  { value: 'title', label: 'Title' },
  { value: 'status', label: 'Status' },
];

const orderOptions: readonly SelectOption<SortOrder>[] = [
  { value: 'desc', label: 'Descending' },
  { value: 'asc', label: 'Ascending' },
];

export interface TaskFiltersBarProps {
  readonly searchDraft: string;
  readonly onSearchDraftChange: (value: string) => void;
  readonly onApplySearch: () => void;
  readonly params: ListTasksParams;
  readonly onParamsChange: (patch: Partial<ListTasksParams>) => void;
}

export function TaskFiltersBar({
  searchDraft,
  onSearchDraftChange,
  onApplySearch,
  params,
  onParamsChange,
}: TaskFiltersBarProps): ReactElement {
  return (
    <div className="filters">
      <div className="filters__row">
        <Input
          id="task-search"
          label="Search"
          placeholder="Title or description"
          value={searchDraft}
          onChange={(event) => {
            onSearchDraftChange(event.target.value);
          }}
        />
        <div className="filters__actions">
          <Button type="button" variant="secondary" onClick={onApplySearch}>
            Apply search
          </Button>
        </div>
      </div>
      <div className="filters__row filters__row--grid">
        <Select<TaskStatus | ''>
          id="task-status"
          label="Status"
          value={params.status ?? ''}
          options={statusOptions}
          onChange={(event) => {
            const v = event.target.value;
            onParamsChange({
              status: v === '' ? undefined : (v as TaskStatus),
            });
          }}
        />
        <Select<TaskSortField>
          id="task-sort"
          label="Sort by"
          value={params.sortBy}
          options={sortOptions}
          onChange={(event) => {
            onParamsChange({ sortBy: event.target.value as TaskSortField });
          }}
        />
        <Select<SortOrder>
          id="task-order"
          label="Order"
          value={params.order}
          options={orderOptions}
          onChange={(event) => {
            onParamsChange({ order: event.target.value as SortOrder });
          }}
        />
      </div>
    </div>
  );
}
