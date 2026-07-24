/** @vitest-environment jsdom */
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { setLandingMockScenario } from '../api/mock/handlers/landing.handlers';
import {
  setConsoleMockScenario,
  setSessionMockScenario,
} from '../api/mock/handlers/workspace.handlers';
import { App } from './App';

afterEach(() => {
  setLandingMockScenario('success');
  setSessionMockScenario('success');
  setConsoleMockScenario('success');
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
    setLandingMockScenario('success');
    renderAt('/');
    await waitFor(() =>
      expect(screen.getByText('CIB Data Services')).toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(screen.getByText('Physical datasets')).toBeInTheDocument(),
    );
  });

  it('renders workspace console at /workspace', async () => {
    setSessionMockScenario('success');
    setConsoleMockScenario('success');
    renderAt('/workspace');
    await waitFor(() =>
      expect(screen.getByTestId('workspace-shell')).toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Good (morning|afternoon|evening), Test\./i),
      ).toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: 'Producer' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('redirects unknown paths to landing (no catalogue/shell routes)', async () => {
    setLandingMockScenario('success');
    renderAt('/catalogue');
    await waitFor(() =>
      expect(screen.getByText('CIB Data Services')).toBeInTheDocument(),
    );
    expect(screen.queryByText(/Browse catalogue/i)).toBeTruthy();
    const browse = screen.getAllByRole('button', { name: /Browse catalogue/i })[0];
    expect(browse).toBeDisabled();
    await waitFor(() =>
      expect(screen.getByText('Physical datasets')).toBeInTheDocument(),
    );
  });
});
