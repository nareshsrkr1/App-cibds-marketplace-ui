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

async function openGlossaryTab() {
  renderCatalogue();
  await screen.findByText('1CAT Investments Trades');
  fireEvent.click(screen.getByRole('tab', { name: 'Glossary Terms' }));
  await screen.findByText('Accrued Interest');
  return screen.getByTestId('physical-datasets');
}

describe('Glossary Terms tab', () => {
  it('lists all 74 terms, paginated', async () => {
    const page = await openGlossaryTab();
    expect(within(page).getByText('74 terms')).toBeInTheDocument();
    expect(page.querySelector('.ui-pagination')).toBeInTheDocument();
  });

  it('search narrows results and resets pagination', async () => {
    const page = await openGlossaryTab();
    fireEvent.change(screen.getByLabelText('Search glossary terms'), {
      target: { value: 'Accrued Interest' },
    });
    await waitFor(() => expect(within(page).getByText('1 terms')).toBeInTheDocument());
    expect(page.querySelector('.ui-pagination')).not.toBeInTheDocument();
  });

  it('subject area filter narrows results', async () => {
    const page = await openGlossaryTab();
    fireEvent.change(screen.getByLabelText('Filter by subject area'), {
      target: { value: 'trade-valuation-economics' },
    });
    await waitFor(() => expect(within(page).getByText('8 terms')).toBeInTheDocument());
  });

  it('expanding a term shows its definition and BDE rollup, with a working lineage link', async () => {
    const page = await openGlossaryTab();
    fireEvent.click(within(page).getByText('Accrued Interest'));

    const detail = await waitFor(() => {
      const el = page.querySelector('.gls-detail');
      expect(el).toBeTruthy();
      return el as HTMLElement;
    });
    expect(
      within(detail).getByText(
        'Interest earned on a fixed-income position since the last coupon payment date but not yet paid.',
      ),
    ).toBeInTheDocument();
    expect(within(detail).getByText('BDE_D011')).toBeInTheDocument();

    fireEvent.click(within(detail).getByRole('button', { name: '↳ View lineage' }));
    await screen.findByText('Intelligence · Lineage');
  });

  it('Bulk upload and New term are inert future-release affordances', async () => {
    const page = await openGlossaryTab();
    expect(within(page).getByRole('button', { name: 'Bulk upload' })).toBeDisabled();
    expect(within(page).getByRole('button', { name: 'New term' })).toBeDisabled();
  });
});
