import type { ReactElement } from 'react';

export function Spinner({ label = 'Loading' }: { readonly label?: string | undefined }): ReactElement {
  return (
    <div className="spinner" role="status" aria-live="polite">
      <span className="spinner__dot" />
      <span className="spinner__label">{label}</span>
    </div>
  );
}
