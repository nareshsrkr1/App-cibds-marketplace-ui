import type { ToastItem, ToastTone } from '../../../services/toastService';
import { Button } from '../../ui/Button/Button';

export type ToastProps = { toast: ToastItem; onDismiss: (id: string) => void };

const toneClass: Record<ToastTone, string> = {
  success: 'ui-toast--success',
  info: 'ui-toast--info',
  warning: 'ui-toast--warning',
  error: 'ui-toast--error',
};

export function Toast({ toast, onDismiss }: ToastProps) {
  return (
    <div className={['ui-toast', toneClass[toast.tone]].join(' ')} role="status">
      <span>{toast.message}</span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(toast.id)}
      >
        Dismiss
      </Button>
    </div>
  );
}
