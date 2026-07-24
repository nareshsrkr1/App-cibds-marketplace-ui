export type ToastTone = 'success' | 'info' | 'warning' | 'error';

export type ToastItem = { id: string; tone: ToastTone; message: string };

type Listener = (toasts: ToastItem[]) => void;

const DEFAULT_MS: Record<ToastTone, number> = {
  success: 4000,
  info: 4000,
  warning: 5000,
  error: 8000,
};

let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function emit() {
  for (const listener of listeners) listener(toasts);
}

function push(tone: ToastTone, message: string) {
  const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const item: ToastItem = { id, tone, message };
  toasts = [...toasts, item];
  emit();
  const timer = setTimeout(() => dismissToast(id), DEFAULT_MS[tone]);
  timers.set(id, timer);
  return id;
}

export function dismissToast(id: string) {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function subscribeToasts(listener: Listener) {
  listeners.add(listener);
  listener(toasts);
  return () => {
    listeners.delete(listener);
  };
}

/** Public read of the auto-dismiss duration for a tone (used to drive the toast's countdown bar). */
export function getToastDuration(tone: ToastTone): number {
  return DEFAULT_MS[tone];
}

export const toast = {
  success: (message: string) => push('success', message),
  info: (message: string) => push('info', message),
  warning: (message: string) => push('warning', message),
  error: (message: string) => push('error', message),
};

/** Test helper — clear stacked toasts and timers. */
export function __resetToastsForTests() {
  for (const timer of timers.values()) clearTimeout(timer);
  timers.clear();
  toasts = [];
  emit();
}

export function __toastDurations() {
  return { ...DEFAULT_MS };
}
