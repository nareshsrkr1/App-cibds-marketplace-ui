/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import {
  setConsoleMockScenario,
  setConsoleSectionScenario,
  setSessionMockScenario,
} from '../../api/mock/handlers/workspace.handlers';
import { ProducerPage } from '../producer/ProducerPage';
import { SessionProvider } from '../session/SessionProvider';
import { BulkUploadPdesPage } from './bulkPde/BulkUploadPdesPage';
import { WorkspaceConsolePage } from './WorkspaceConsolePage';
import { WorkspacePage } from './WorkspacePage';

afterEach(() => {
  setSessionMockScenario('success');
  setConsoleMockScenario('success');
});

function renderPage(path = '/workspace') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SessionProvider>
        <Routes>
          <Route path="/workspace" element={<WorkspacePage />}>
            <Route index element={<WorkspaceConsolePage />} />
            <Route path="bulk-upload-pdes" element={<BulkUploadPdesPage />} />
            <Route path="register-physical-dataset" element={<ProducerPage />} />
          </Route>
        </Routes>
      </SessionProvider>
    </MemoryRouter>,
  );
}

describe('WorkspacePage', () => {
  it('shows Producer enabled and other personas disabled by default', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('workspace-shell')).toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: 'Producer' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Producer' })).not.toBeDisabled();
    for (const label of ['Governance', 'Consumer', 'Admin']) {
      expect(screen.getByRole('button', { name: label })).toBeDisabled();
    }
  });

  it('loads hero, tiered charts, consumers, and subscription panels from APIs', async () => {
    renderPage();
    await waitFor(() =>
      expect(
        screen.getByText(/Good (morning|afternoon|evening), Test\./i),
      ).toBeInTheDocument(),
    );
    expect(
      screen.getByText(/Everything you produce — governed, bound, and accounted for/i),
    ).toBeInTheDocument();
    const consoleRoot = screen.getByTestId('producer-console');
    expect(consoleRoot.querySelector('.sh-kpis')?.textContent).toMatch(/My datasets/);
    expect(consoleRoot.querySelector('.sh-kpis')?.textContent).toMatch(
      /Producer contracts held/,
    );
    expect(consoleRoot.querySelector('.sh-actions')).toBeTruthy();
    // "Register a physical dataset" and "Track workflow" stay disabled for this
    // phased rollout — Bulk upload / Bind columns are live today.
    for (const name of ['Bulk upload PDEs', 'Bind columns']) {
      const btn = Array.from(consoleRoot.querySelectorAll('button')).find(
        (el) => el.textContent?.trim() === name,
      );
      expect(btn, name).toBeTruthy();
      expect(btn).not.toBeDisabled();
    }
    const heroWorkflow = Array.from(consoleRoot.querySelectorAll('button')).find(
      (el) => el.textContent?.trim() === 'Track workflow',
    );
    expect(heroWorkflow).toBeDisabled();
    const heroRegister = Array.from(consoleRoot.querySelectorAll('button')).find(
      (el) => el.textContent?.trim() === 'Register a physical dataset',
    );
    expect(heroRegister).toBeDisabled();
    await waitFor(() => {
      expect(screen.getByText('My production health')).toBeInTheDocument();
      expect(screen.getByText('Publish SLA adherence')).toBeInTheDocument();
      expect(document.querySelector('.bi-tier-l')?.textContent).toMatch(
        /My production health/,
      );
      expect(
        Array.from(document.querySelectorAll('.bi-tier-l')).some((el) =>
          el.textContent?.includes('My data'),
        ),
      ).toBe(true);
    });
    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: /My consumers · last delivery & SLA/i,
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: /Subscription requests · awaiting your approval/i,
        }),
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByRole('heading', { level: 3, name: 'Sent to governance' }),
    ).toBeNull();
    expect(screen.getByRole('button', { name: 'Console' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await waitFor(() => {
      expect(
        screen.getAllByRole('button', { name: 'Register a Physical Dataset' }).length,
      ).toBeGreaterThanOrEqual(1);
    });
    const nav = screen.getByLabelText('Workspace');
    expect(
      within(nav).getByRole('button', { name: 'Register a Physical Dataset' }),
    ).toBeDisabled();
  });

  it('Register a physical dataset stays disabled (future release) in hero and nav', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('producer-console')).toBeInTheDocument(),
    );

    const heroRegister = within(screen.getByTestId('producer-console')).getByRole(
      'button',
      { name: 'Register a physical dataset' },
    );
    expect(heroRegister).toBeDisabled();
    expect(heroRegister).toHaveAttribute('title', 'Available in a future release');

    const navRegister = within(screen.getByLabelText('Workspace')).getByRole('button', {
      name: 'Register a Physical Dataset',
    });
    expect(navRegister).toBeDisabled();
    expect(navRegister).toHaveAttribute('title', 'Available in a future release');

    fireEvent.click(heroRegister);
    expect(
      screen.queryByRole('heading', { name: /Register a physical dataset/i }),
    ).not.toBeInTheDocument();
  });

  it('keeps Producer nav when other personas are disabled', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('workspace-shell')).toBeInTheDocument(),
    );
    await waitFor(() => {
      expect(
        screen.getAllByRole('button', { name: 'Register a Physical Dataset' }).length,
      ).toBeGreaterThanOrEqual(1);
    });

    const governance = screen.getByRole('button', { name: 'Governance' });
    expect(governance).toBeDisabled();
    fireEvent.click(governance);
    expect(
      within(screen.getByLabelText('Workspace')).getByRole('button', {
        name: 'Register a Physical Dataset',
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Own the vocabulary/i)).not.toBeInTheDocument();
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
      expect(
        screen.getByText(/Good (morning|afternoon|evening), Test\./i),
      ).toBeInTheDocument(),
    );
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /Unable to retrieve console charts/i,
      );
    });
    expect(screen.getByTestId('producer-console')).toBeInTheDocument();
  });
});
