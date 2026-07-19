/** @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { AppErrorBoundary } from './AppErrorBoundary';

function Boom({ fail }: { fail: boolean }) {
  if (fail) throw new Error('boom');
  return <div>ok</div>;
}

describe('AppErrorBoundary', () => {
  it('shows themed fallback without exposing the stack and supports retry', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { rerender } = render(
      <AppErrorBoundary>
        <Boom fail />
      </AppErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(/Something went wrong/i);
    expect(screen.queryByText(/boom/i)).not.toBeInTheDocument();
    // Flip child to non-throwing before retry so recovery succeeds
    rerender(
      <AppErrorBoundary>
        <Boom fail={false} />
      </AppErrorBoundary>,
    );
    fireEvent.click(screen.getByRole('button', { name: /Try again/i }));
    expect(screen.getByText('ok')).toBeInTheDocument();
    spy.mockRestore();
  });
});
