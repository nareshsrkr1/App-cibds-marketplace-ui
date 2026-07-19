import type { ReactNode } from 'react';
import { Button } from '../../ui/Button/Button';

export type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
  action?: ReactNode;
};

export function ErrorState({
  title = 'Unable to load content',
  description = 'Something went wrong. Please try again.',
  onRetry,
  action,
}: ErrorStateProps) {
  return (
    <div className="ui-state" role="alert">
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
