import type { ReactNode } from 'react';

export type EmptyStateProps = { title: string; description?: string; action?: ReactNode };

function EmptyIcon() {
  return (
    <svg
      className="ui-state__icon"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 11.5 6.5 4.5h11l2.5 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M4 11.5h5a1 1 0 0 1 1 1 2 2 0 0 0 4 0 1 1 0 0 1 1-1h5V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="ui-state" role="status">
      <EmptyIcon />
      <div className="ui-state__title">{title}</div>
      {description ? <p>{description}</p> : null}
      {action}
    </div>
  );
}
