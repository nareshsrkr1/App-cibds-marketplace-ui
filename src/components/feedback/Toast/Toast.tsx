import type { CSSProperties } from 'react';
import { getToastDuration, type ToastItem, type ToastTone } from '../../../services/toastService';
import { Button } from '../../ui/Button/Button';

export type ToastProps = { toast: ToastItem; onDismiss: (id: string) => void };

const toneClass: Record<ToastTone, string> = {
  success: 'ui-toast--success',
  info: 'ui-toast--info',
  warning: 'ui-toast--warning',
  error: 'ui-toast--error',
};

function ToastIcon({ tone }: { tone: ToastTone }) {
  switch (tone) {
    case 'success':
      return (
        <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M5 8.2 7 10.2 11 5.8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'error':
      return (
        <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <line
            x1="5.5"
            y1="5.5"
            x2="10.5"
            y2="10.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="10.5"
            y1="5.5"
            x2="5.5"
            y2="10.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'warning':
      return (
        <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M8 2 14.5 13H1.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <line x1="8" y1="6.5" x2="8" y2="9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="8" cy="11.3" r="0.9" fill="currentColor" />
        </svg>
      );
    default:
      return (
        <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <line x1="8" y1="7.2" x2="8" y2="11.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="8" cy="4.9" r="0.9" fill="currentColor" />
        </svg>
      );
  }
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const durationMs = getToastDuration(toast.tone);
  const style = { '--toast-ms': `${durationMs}ms` } as CSSProperties;

  return (
    <div
      className={['ui-toast', toneClass[toast.tone]].join(' ')}
      role="status"
      style={style}
    >
      <span className="ui-toast__icon" aria-hidden="true">
        <ToastIcon tone={toast.tone} />
      </span>
      <span className="ui-toast__msg">{toast.message}</span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(toast.id)}
      >
        Dismiss
      </Button>
      <span className="ui-toast__bar" aria-hidden="true" />
    </div>
  );
}
