import { useEffect, type RefObject } from 'react';

/**
 * Escape-to-close, Tab focus-trap within `dialogRef`, and focus-restore on close.
 * Shared by `Modal` and any other hand-rolled dialog that can't use `Modal`'s
 * own markup (different header/footer layout) but still needs the same a11y.
 */
export function useModalA11y(
  open: boolean,
  dialogRef: RefObject<HTMLElement | null>,
  onClose: () => void,
  initialFocusRef?: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusTarget = initialFocusRef?.current ?? dialogRef.current;
    focusTarget?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const selector =
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(selector);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus();
    };
  }, [open, onClose, dialogRef, initialFocusRef]);
}
