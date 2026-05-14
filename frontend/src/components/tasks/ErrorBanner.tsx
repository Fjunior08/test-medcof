import type { ReactElement } from 'react';
import { Button } from '@/components/ui/Button';

export interface ErrorBannerProps {
  readonly message: string;
  readonly onRetry?: (() => void) | undefined;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps): ReactElement {
  return (
    <div className="error-banner" role="alert">
      <p>{message}</p>
      {onRetry !== undefined ? (
        <Button type="button" variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
