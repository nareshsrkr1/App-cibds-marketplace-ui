/** @vitest-environment jsdom */
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ToastProvider } from '../../../components/feedback/Toast/ToastProvider';
import { SessionProvider } from '../../session/SessionProvider';
import { WorkspacePage } from '../WorkspacePage';
import { WorkspaceConsolePage } from '../WorkspaceConsolePage';
import { LineageExplorerPage } from './LineageExplorerPage';

function renderExplorer() {
  return render(
    <MemoryRouter initialEntries={['/workspace/lineage-explorer']}>
      <SessionProvider>
        <Routes>
          <Route path="/workspace" element={<WorkspacePage />}>
            <Route index element={<WorkspaceConsolePage />} />
            <Route path="lineage-explorer" element={<LineageExplorerPage />} />
          </Route>
        </Routes>
        <ToastProvider />
      </SessionProvider>
    </MemoryRouter>,
  );
}

describe('Lineage Explorer page', () => {
  it('shows the search dropdown, legend, and quick-pick cards', async () => {
    renderExplorer();
    await screen.findByLabelText('Trace a business element');
    const page = screen.getByTestId('lineage-explorer');
    expect(within(page).getByText('Glossary term')).toBeInTheDocument();
    expect(within(page).getByText('Frequently traced — critical data elements first')).toBeInTheDocument();
    expect(page.querySelectorAll('.lx-pick')).toHaveLength(8);
  });

  it('selecting an element from the search dropdown opens the lineage modal', async () => {
    renderExplorer();
    const select = await screen.findByLabelText('Trace a business element');
    fireEvent.change(select, { target: { value: 'Trade Identifier' } });

    await screen.findByText('Intelligence · Lineage');
    expect(screen.getByRole('img', { name: /Lineage diagram for/i })).toBeInTheDocument();
  });

  it('clicking a quick-pick card opens the lineage modal for that element', async () => {
    renderExplorer();
    await screen.findByText('Frequently traced — critical data elements first');
    const page = screen.getByTestId('lineage-explorer');
    const firstPick = page.querySelectorAll('.lx-pick')[0] as HTMLElement;
    fireEvent.click(firstPick);

    await screen.findByText('Intelligence · Lineage');
  });
});
