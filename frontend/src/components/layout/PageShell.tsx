import type { ReactElement, ReactNode } from 'react';

export function PageShell({
  title,
  actions,
  children,
}: {
  readonly title: string;
  readonly actions?: ReactNode | undefined;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">{title}</h1>
        {actions !== undefined ? <div className="page__actions">{actions}</div> : null}
      </header>
      <div className="page__body">{children}</div>
    </div>
  );
}
