/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ToastProvider } from './ToastProvider';
import { __resetToastsForTests, __toastDurations, toast } from '../../../services/toastService';

beforeEach(() => {
  __resetToastsForTests();
  vi.useFakeTimers();
});

afterEach(() => {
  __resetToastsForTests();
  vi.useRealTimers();
});

describe('ToastProvider', () => {
  it('renders stacked toasts and supports manual dismiss', () => {
    render(<ToastProvider />);
    act(() => {
      toast.success('Dataset saved successfully');
      toast.error('Unable to load marketplace metrics');
    });

    expect(screen.getByText('Dataset saved successfully')).toBeInTheDocument();
    expect(screen.getByText('Unable to load marketplace metrics')).toBeInTheDocument();

    const dismissButtons = screen.getAllByRole('button', { name: /Dismiss notification/i });
    fireEvent.click(dismissButtons[0]);

    expect(screen.queryByText('Dataset saved successfully')).not.toBeInTheDocument();
    expect(screen.getByText('Unable to load marketplace metrics')).toBeInTheDocument();
  });

  it('auto-dismisses success toasts after the standard duration', () => {
    render(<ToastProvider />);
    act(() => {
      toast.success('Auto dismiss me');
    });
    expect(screen.getByText('Auto dismiss me')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(__toastDurations().success);
    });

    expect(screen.queryByText('Auto dismiss me')).not.toBeInTheDocument();
  });

  it('keeps error toasts visible longer than success toasts', () => {
    render(<ToastProvider />);
    act(() => {
      toast.error('Keep me around');
    });

    act(() => {
      vi.advanceTimersByTime(__toastDurations().success);
    });
    expect(screen.getByText('Keep me around')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(__toastDurations().error - __toastDurations().success);
    });
    expect(screen.queryByText('Keep me around')).not.toBeInTheDocument();
  });
});
