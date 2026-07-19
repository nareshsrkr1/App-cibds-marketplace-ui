/** @vitest-environment jsdom */
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import {
  setConsoleMockScenario,
  setConsoleSectionScenario,
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

  it('loads hero, charts, and panels from separate mock APIs', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/Good (morning|afternoon|evening), Test\./i)).toBeInTheDocument(),
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
    await waitFor(() => {
      expect(screen.getByText('Elements by sub-domain')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: /Subscription requests · awaiting your approval/i,
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { level: 3, name: 'Sent to governance' }),
      ).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Console' })).toHaveAttribute('aria-current', 'page');
  });

  it('shows console error state when hero API fails', async () => {
    setConsoleSectionScenario('hero', 'error');
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /Unable to load console|Unable to retrieve console/i,
      );
    });
  });

  it('keeps hero visible when charts API fails', async () => {
    setConsoleSectionScenario('charts', 'error');
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/Good (morning|afternoon|evening), Test\./i)).toBeInTheDocument(),
    );
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Unable to retrieve console charts/i);
    });
    expect(screen.getByTestId('producer-console')).toBeInTheDocument();
  });
});
