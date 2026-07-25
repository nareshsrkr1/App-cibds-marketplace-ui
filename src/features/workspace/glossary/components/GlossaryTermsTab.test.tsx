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

  it('New term submits a proposed term that appears in the list', async () => {
    const page = await openGlossaryTab();
    fireEvent.click(within(page).getByRole('button', { name: 'New term' }));

    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Submit' }));
    expect(within(dialog).getAllByText('Required.').length).toBeGreaterThan(0);

    fireEvent.change(within(dialog).getByLabelText(/Term name/), {
      target: { value: 'Gross Exposure' },
    });
    fireEvent.change(within(dialog).getByLabelText(/Proposed definition/), {
      target: { value: 'Total exposure to a counterparty across all positions.' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Submit' }));

    await within(dialog).findByText('Submitted as Proposed');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Done' }));

    await waitFor(() => expect(within(page).getByText('75 terms')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Search glossary terms'), {
      target: { value: 'Gross Exposure' },
    });
    await waitFor(() => expect(within(page).getByText('1 terms')).toBeInTheDocument());
    expect(within(page).getByText('Gross Exposure')).toBeInTheDocument();
  });

  it('Bulk upload parses a CSV, validates rows, and applies the valid ones', async () => {
    const page = await openGlossaryTab();
    fireEvent.click(within(page).getByRole('button', { name: 'Bulk upload' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Upload')).toBeInTheDocument();
    expect(within(dialog).getByText('Validate')).toBeInTheDocument();
    expect(within(dialog).getByText('Apply')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /Download sample CSV/ })).toBeInTheDocument();

    const csv = [
      'Term,Subject area,Definition,Classification,PII',
      'Gross Exposure,Market Risk Sensitivities,Total exposure to a counterparty.,Confidential,No',
      ',Market Risk Sensitivities,Missing a term name.,Internal,No',
    ].join('\n');
    const file = new File([csv], 'terms.csv', { type: 'text/csv' });
    fireEvent.change(within(dialog).getByTestId('bulk-terms-file-input'), {
      target: { files: [file] },
    });

    await within(dialog).findByText('Gross Exposure');
    expect(within(dialog).getByText('⚠ Missing term name')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /Apply 1 valid term/ })).toBeEnabled();

    fireEvent.click(within(dialog).getByRole('button', { name: /Apply 1 valid term/ }));
    await within(dialog).findByText('1 record applied');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Done' }));

    await waitFor(() => expect(within(page).getByText('75 terms')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Search glossary terms'), {
      target: { value: 'Gross Exposure' },
    });
    await waitFor(() => expect(within(page).getByText('1 terms')).toBeInTheDocument());
    expect(within(page).getByText('Gross Exposure')).toBeInTheDocument();
  });
});
