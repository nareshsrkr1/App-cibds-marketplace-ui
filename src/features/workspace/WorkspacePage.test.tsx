/** @vitest-environment jsdom */
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import {
  setConsoleMockScenario,
  setSessionMockScenario,
} from '../../mocks/workspace/handlers';
import { WorkspacePage } from './WorkspacePage';

afterEach(() => {
  setSessionMockScenario('success');
  setConsoleMockScenario('success');
});

function renderPage() {
  return render(
    <MemoryRouter>
      <WorkspacePage />
    </MemoryRouter>,
  );
}

describe('WorkspacePage', () => {
  it('shows all personas with Producer active and others disabled', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByTestId('workspace-shell')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Producer' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Producer' })).not.toBeDisabled();
    for (const label of ['Governance', 'Consumer', 'Admin']) {
      const btn = screen.getByRole('button', { name: label });
      expect(btn).toBeDisabled();
      expect(btn).toBeVisible();
    }
  });

  it('renders Producer console greeting, KPIs, and actions from mock API', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/Good afternoon, Test\./i)).toBeInTheDocument(),
    );
    expect(
      screen.getByText(/Everything you produce — governed, bound, and accounted for/i),
    ).toBeInTheDocument();
    const consoleRoot = screen.getByTestId('producer-console');
    expect(consoleRoot.querySelector('.sh-kpis')?.textContent).toMatch(/My datasets/);
    expect(consoleRoot.querySelector('.sh-kpis')?.textContent).toMatch(/Offers held/);
    expect(consoleRoot.querySelector('.sh-actions')).toBeTruthy();
    const actionNames = [
      'Register a dataset',
      'Bulk upload PDEs',
      'Bind columns',
      'Track workflow',
    ];
    for (const name of actionNames) {
      const btn = Array.from(consoleRoot.querySelectorAll('button')).find(
        (el) => el.textContent?.trim() === name,
      );
      expect(btn, name).toBeTruthy();
      expect(btn).toBeDisabled();
    }
    expect(screen.getByText('Elements by sub-domain')).toBeInTheDocument();
    expect(
      consoleRoot.querySelector('.sh-bh h3')?.textContent,
    ).toMatch(/Subscription requests/);
    expect(screen.getByRole('button', { name: 'Console' })).toHaveAttribute('aria-current', 'page');
  });

  it('shows console error state when console API fails', async () => {
    setConsoleMockScenario('error');
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Unable to load console|Unable to retrieve console/i);
    });
  });
});
