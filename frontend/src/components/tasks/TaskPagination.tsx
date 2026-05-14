import type { ReactElement } from 'react';
import type { TasksListMetadata } from '@/types/task.types';
import { Button } from '@/components/ui/Button';

export interface TaskPaginationProps {
  readonly meta: TasksListMetadata;
  readonly onPageChange: (page: number) => void;
}

export function TaskPagination({ meta, onPageChange }: TaskPaginationProps): ReactElement {
  const { page, totalPages, total, limit } = meta;
  const hasPrev = page > 1;
  const hasNext = totalPages > 0 && page < totalPages;

  return (
    <div className="pagination" aria-label="Tasks pagination">
      <span className="pagination__info">
        Page {page} of {Math.max(totalPages, 1)} · {total} tasks · {limit} per page
      </span>
      <div className="pagination__controls">
        <Button
          type="button"
          variant="secondary"
          disabled={!hasPrev}
          onClick={() => {
            onPageChange(page - 1);
          }}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={!hasNext}
          onClick={() => {
            onPageChange(page + 1);
          }}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
