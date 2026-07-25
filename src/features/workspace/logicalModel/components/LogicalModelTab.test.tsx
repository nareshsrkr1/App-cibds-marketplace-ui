/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ToastProvider } from '../../../../components/feedback/Toast/ToastProvider';
import { SessionProvider } from '../../../session/SessionProvider';
import { WorkspaceConsolePage } from '../../WorkspaceConsolePage';
import { WorkspacePage } from '../../WorkspacePage';
import { PhysicalDatasetsPage } from '../../physicalDatasets/PhysicalDatasetsPage';

function renderCatalogue() {
  return render(
    <MemoryRouter initialEntries={['/workspace/physical-datasets']}>
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

async function openLogicalModelTab() {
  renderCatalogue();
  await screen.findByText('1CAT Investments Trades');
  fireEvent.click(screen.getByRole('tab', { name: 'Logical Model' }));
  const page = screen.getByTestId('physical-datasets');
  await within(page).findByText('14 subject areas');
  return page;
}

/** Scoped to the row-rendering area only — excludes the toolbar's subject-area filter
 * <select>, whose <option> text (subject area names) would otherwise collide with the
 * matching row's own text and make plain getByText ambiguous. */
function lgmTable(page: HTMLElement) {
  return within(page.querySelector('.lgm-table') as HTMLElement);
}

describe('Logical Model tab', () => {
  it('lists all 14 subject areas, paginated', async () => {
    const page = await openLogicalModelTab();
    expect(within(page).getByText('14 subject areas')).toBeInTheDocument();
    expect(page.querySelector('.ui-pagination')).toBeInTheDocument();
  });

  it('search narrows results and resets pagination', async () => {
    const page = await openLogicalModelTab();
    fireEvent.change(screen.getByLabelText('Search subject areas'), {
      target: { value: 'Trade Lifecycle' },
    });
    await waitFor(() => expect(within(page).getByText('1 subject areas')).toBeInTheDocument());
    expect(page.querySelector('.ui-pagination')).not.toBeInTheDocument();
    expect(lgmTable(page).getByText('Trade Lifecycle')).toBeInTheDocument();
  });

  it('expands subject area → logical dataset → BDE, preserving the search filter', async () => {
    const page = await openLogicalModelTab();
    fireEvent.change(screen.getByLabelText('Search subject areas'), {
      target: { value: 'Trade Lifecycle' },
    });
    await waitFor(() => expect(within(page).getByText('1 subject areas')).toBeInTheDocument());

    fireEvent.click(lgmTable(page).getByText('Trade Lifecycle'));
    await within(page).findByText('Trade Identifiers');
    expect(within(page).getByText('Trade Events & Status')).toBeInTheDocument();

    fireEvent.click(within(page).getByText('Trade Identifiers'));
    await within(page).findByText('Parent Trade Identifier');
    expect(within(page).getByText('Trade Reference')).toBeInTheDocument();

    // The search filter itself must still read "Trade Lifecycle" after expanding two levels.
    expect(screen.getByLabelText('Search subject areas')).toHaveValue('Trade Lifecycle');
  });

  it('expands a BDE row to show its definition and realizing datasets', async () => {
    const page = await openLogicalModelTab();
    fireEvent.change(screen.getByLabelText('Search subject areas'), {
      target: { value: 'Trade Lifecycle' },
    });
    await waitFor(() => expect(within(page).getByText('1 subject areas')).toBeInTheDocument());
    fireEvent.click(lgmTable(page).getByText('Trade Lifecycle'));
    await within(page).findByText('Trade Identifiers');
    fireEvent.click(within(page).getByText('Trade Identifiers'));
    await within(page).findByText('Trade Identifier');

    fireEvent.click(within(page).getByText('Trade Identifier'));
    await within(page).findByText(
      'The system-of-record identifier assigned to a trade at execution.',
    );
    // Scope to the Logical Model tab's own content — the Physical Datasets tab stays
    // mounted (hidden) alongside it and also renders "1CAT Investments Trades".
    const lgm = page.querySelector('.lgm') as HTMLElement;
    expect(within(lgm).getByText('1CAT Investments Trades')).toBeInTheDocument();
  });

  it('opens the BDE detail modal from the info button', async () => {
    const page = await openLogicalModelTab();
    fireEvent.change(screen.getByLabelText('Search subject areas'), {
      target: { value: 'Trade Lifecycle' },
    });
    await waitFor(() => expect(within(page).getByText('1 subject areas')).toBeInTheDocument());
    fireEvent.click(lgmTable(page).getByText('Trade Lifecycle'));
    await within(page).findByText('Trade Identifiers');
    fireEvent.click(within(page).getByText('Trade Identifiers'));
    await within(page).findByText('Trade Identifier');

    fireEvent.click(screen.getByLabelText('View record for Trade Identifier'));
    await screen.findByText('Business Data Element · BDE_D001');
    expect(screen.getByText('ISO 11179 name decomposition')).toBeInTheDocument();
  });
});
