/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('exposes an accessible loading status', () => {
    render(<Spinner size="md" label="Loading" />);
    const el = screen.getByRole('status', { name: 'Loading' });
    expect(el).toBeInTheDocument();
    expect(el.className).toContain('ui-spinner--md');
  });
});
