/** @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Modal } from './Modal';

describe('Modal', () => {
  it('closes on Escape and returns focus to the trigger', () => {
    const onClose = vi.fn();
    function Harness() {
      return (
        <>
          <button type="button" id="trigger">
            Open
          </button>
          <Modal open title="Confirm" onClose={onClose}>
            <p>Modal body</p>
          </Modal>
        </>
      );
    }
    render(<Harness />);
    const trigger = document.getElementById('trigger') as HTMLButtonElement;
    trigger.focus();
    expect(screen.getByRole('dialog', { name: 'Confirm' })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render when closed', () => {
    const { rerender } = render(
      <Modal open={false} title="Hidden" onClose={() => undefined}>
        <p>secret</p>
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    rerender(
      <Modal open title="Visible" onClose={() => undefined}>
        <p>secret</p>
      </Modal>,
    );
    expect(screen.getByRole('dialog', { name: 'Visible' })).toBeInTheDocument();
  });
});
