/** @vitest-environment jsdom */
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { setMockFetchMode } from './apiClient';
import { App } from './App';

afterEach(() => {
  setMockFetchMode('success');
});

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('App routes', () => {
  it('renders landing at /', async () => {
    setMockFetchMode('success');
    renderAt('/');
    expect(screen.getByText('CIB Data Services')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Physical datasets')).toBeInTheDocument());
  });

  it('redirects unknown paths to landing (no catalogue/shell routes)', async () => {
    setMockFetchMode('success');
    renderAt('/catalogue');
    expect(screen.getByText('CIB Data Services')).toBeInTheDocument();
    expect(screen.queryByText(/Browse catalogue/i)).toBeTruthy();
    const browse = screen.getAllByRole('button', { name: /Browse catalogue/i })[0];
    expect(browse).toBeDisabled();
    await waitFor(() => expect(screen.getByText('Physical datasets')).toBeInTheDocument());
  });
});
