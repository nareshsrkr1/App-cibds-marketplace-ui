/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../../../components/feedback/Toast/ToastProvider';
import {
  setConsoleMockScenario,
  setSessionMockScenario,
} from '../../../api/mock/handlers/workspace.handlers';
import { SessionProvider } from '../../session/SessionProvider';
import { __resetToastsForTests } from '../../../services/toastService';
import { WorkspaceConsolePage } from '../WorkspaceConsolePage';
import { WorkspacePage } from '../WorkspacePage';
import { PhysicalDatasetsPage } from './PhysicalDatasetsPage';

afterEach(() => {
  setSessionMockScenario('success');
  setConsoleMockScenario('success');
  __resetToastsForTests();
});

function renderWorkspace(path = '/workspace') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SessionProvider>
        <Routes>
          <Route path="/workspace" element={<WorkspacePage />}>
            <Route index element={<WorkspaceConsolePage />} />
            <Route path="physical-datasets/:tab?" element={<PhysicalDatasetsPage />} />
          </Route>
        </Routes>
        <ToastProvider />
      </SessionProvider>
    </MemoryRouter>,
  );
}

/** Waits past the loading/spinner state, then returns the loaded page root. */
async function openLoadedPage(path = '/workspace/physical-datasets') {
  renderWorkspace(path);
  await screen.findByText('1CAT Investments Trades');
  return screen.getByTestId('physical-datasets');
}

describe('Physical datasets catalogue', () => {
  it('opens from the left nav and lists all datasets', async () => {
    renderWorkspace('/workspace');
    await waitFor(() => {
      const nav = screen.getByLabelText('Workspace');
      expect(
        within(nav).getByRole('button', { name: 'Physical Datasets' }),
      ).toBeEnabled();
    });

    fireEvent.click(
      within(screen.getByLabelText('Workspace')).getByRole('button', {
        name: 'Physical Datasets',
      }),
    );

    await screen.findByText('1CAT Investments Trades');
    const page = screen.getByTestId('physical-datasets');
    expect(within(page).getByText('Catalyst Positions')).toBeInTheDocument();
    expect(within(page).getByText('Endur OTC Commodity Trades')).toBeInTheDocument();
    expect(within(page).getByText('Endur Exchange Commodity Trades')).toBeInTheDocument();
    expect(within(page).getByText('Endur Composer Child Trades')).toBeInTheDocument();
    expect(within(page).getByText('Endur P&L and Greeks')).toBeInTheDocument();
    expect(within(page).getByText('6 shown')).toBeInTheDocument();
  });

  it('Logical Model and Glossary Terms tabs are visible and enabled', async () => {
    const page = await openLoadedPage();
    expect(within(page).getByRole('tab', { name: 'Logical Model' })).toBeEnabled();
    expect(within(page).getByRole('tab', { name: 'Glossary Terms' })).toBeEnabled();
  });

  it('search narrows results to matching datasets', async () => {
    const page = await openLoadedPage();

    fireEvent.change(screen.getByLabelText('Search physical datasets'), {
      target: { value: 'Catalyst' },
    });

    await waitFor(() => expect(within(page).getByText('2 shown')).toBeInTheDocument());
    expect(within(page).getByText('Catalyst Positions')).toBeInTheDocument();
    expect(within(page).queryByText('Endur OTC Commodity Trades')).not.toBeInTheDocument();
  });

  it('expanding a row shows its detail fields', async () => {
    const page = await openLoadedPage();

    fireEvent.click(within(page).getByText('1CAT Investments Trades'));

    const detail = page.querySelector('.pdc-detail') as HTMLElement;
    expect(detail).toBeTruthy();
    expect(within(detail).getByText('Source file')).toBeInTheDocument();
    expect(within(detail).getByText('catalyst_trades_sanitized.dat')).toBeInTheDocument();
    expect(within(detail).getByText('BDE binding')).toBeInTheDocument();
    expect(within(detail).getByText('78% of columns bound')).toBeInTheDocument();
  });

  it('Coverage gaps isolates the one flagged dataset', async () => {
    const page = await openLoadedPage();

    fireEvent.click(within(page).getByRole('button', { name: /Coverage gaps/i }));

    await waitFor(() => expect(within(page).getByText('1 shown')).toBeInTheDocument());
    expect(within(page).getByText('Endur Composer Child Trades')).toBeInTheDocument();
  });

  it('pagination controls stay hidden while all datasets fit on one page', async () => {
    const page = await openLoadedPage();
    expect(page.querySelector('.ui-pagination')).not.toBeInTheDocument();
  });

  it('switching tabs and back keeps a tab mounted (hidden) instead of re-fetching', async () => {
    const page = await openLoadedPage();

    fireEvent.click(within(page).getByRole('tab', { name: 'Logical Model' }));
    await within(page).findByText('14 subject areas');

    fireEvent.click(within(page).getByRole('tab', { name: 'Physical Datasets' }));
    // Still showing real content immediately — not a fresh loading spinner.
    expect(within(page).getByText('1CAT Investments Trades')).toBeInTheDocument();

    fireEvent.click(within(page).getByRole('tab', { name: 'Logical Model' }));
    // Same instance, no reload spinner on revisit.
    expect(within(page).getByText('14 subject areas')).toBeInTheDocument();
  });

  it('list/grid toggle switches views', async () => {
    const page = await openLoadedPage();

    expect(page.querySelector('.pdc-table')).toBeInTheDocument();
    fireEvent.click(within(page).getByLabelText('Grid view'));
    expect(page.querySelector('.pdc-cardgrid')).toBeInTheDocument();
  });

  it('Export CSV downloads a file and confirms with a toast', async () => {
    const page = await openLoadedPage();

    const createObjectURL = vi.fn(() => 'blob:mock');
    const revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});

    fireEvent.click(within(page).getByRole('button', { name: 'Export CSV' }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(screen.getByText('Physical datasets exported to CSV.')).toBeInTheDocument(),
    );

    clickSpy.mockRestore();
  });
});
