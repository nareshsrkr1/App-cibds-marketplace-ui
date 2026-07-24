import { useId, useRef, type ReactNode, type RefObject } from 'react';
import { Button } from '../Button/Button';
import { useModalA11y } from './useModalA11y';

export type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** `wide` for content that needs real horizontal room (diagrams, multi-column layouts). */
  size?: 'default' | 'wide';
};

export function Modal({ open, title, onClose, children, initialFocusRef, size = 'default' }: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useModalA11y(open, dialogRef, onClose, initialFocusRef);

  if (!open) return null;

  return (
    <div
      className="ui-modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`ui-modal${size === 'wide' ? ' ui-modal--wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={dialogRef}
        tabIndex={-1}
      >
        <div className="ui-modal__header">
          <h2 id={titleId}>{title}</h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Close dialog"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
