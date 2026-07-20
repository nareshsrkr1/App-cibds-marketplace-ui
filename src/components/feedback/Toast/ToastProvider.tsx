import { useEffect, useState } from 'react';
import {
  subscribeToasts,
  dismissToast,
  type ToastItem,
} from '../../../services/toastService';
import { Toast } from './Toast';

export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  useEffect(() => subscribeToasts(setToasts), []);
  if (toasts.length === 0) return null;
  return (
    <div className="ui-toast-region" aria-live="polite" aria-relevant="additions text">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
}
