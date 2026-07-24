import type { ReactNode } from 'react';
import { Button } from '../../ui/Button/Button';

export type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
  action?: ReactNode;
};

function ErrorIcon() {
  return (
    <svg
      className="ui-state__icon"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" />
      <line
        x1="12"
        y1="7.5"
        x2="12"
        y2="13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16.25" r="1" fill="currentColor" />
    </svg>
  );
}

export function ErrorState({
  title = 'Unable to load content',
  description = 'Something went wrong. Please try again.',
  onRetry,
  action,
}: ErrorStateProps) {
  return (
    <div className="ui-state ui-state--error" role="alert">
      <ErrorIcon />
      <div className="ui-state__title">{title}</div>
      <p>{description}</p>
      {action}
      {!action && onRetry ? (
        <Button type="button" variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
