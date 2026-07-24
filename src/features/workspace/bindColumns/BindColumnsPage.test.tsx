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
import { BindColumnsPage } from './BindColumnsPage';
import { WorkspaceConsolePage } from '../WorkspaceConsolePage';
import { WorkspacePage } from '../WorkspacePage';

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
            <Route path="bind-columns" element={<BindColumnsPage />} />
          </Route>
        </Routes>
        <ToastProvider />
      </SessionProvider>
    </MemoryRouter>,
  );
}

describe('Bind columns', () => {
  it('opens from hero CTA and walks Source → Harvest → Bind', async () => {
    renderWorkspace('/workspace');
    await waitFor(() =>
      expect(screen.getByTestId('producer-console')).toBeInTheDocument(),
    );

    const heroBind = within(screen.getByTestId('producer-console')).getByRole(
      'button',
      { name: 'Bind columns' },
    );
    expect(heroBind).toBeEnabled();
    fireEvent.click(heroBind);

    await waitFor(() =>
      expect(screen.getByTestId('bind-columns')).toBeInTheDocument(),
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /Bind columns to business elements/i,
    );

    await waitFor(() =>
      expect(screen.getByLabelText(/Which dataset are you binding/i)).toBeInTheDocument(),
    );

    expect(
      screen.queryByRole('button', { name: /Harvest from S3/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/Select a dataset to continue/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Which dataset are you binding/i), {
      target: { value: 'DS-CIB-40118' },
    });
    expect(screen.getByText('Binding under')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Harvest from S3/i }),
    ).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: /Harvest from S3/i }));

    await waitFor(() =>
      expect(screen.getByText(/Harvested \d+ columns/i)).toBeInTheDocument(),
    );
    expect(screen.getByText('trade_id')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    await waitFor(() =>
      expect(screen.getByText('Ready to publish')).toBeInTheDocument(),
    );
    const accept = screen.getByRole('button', { name: /Accept all suggested/i });
    expect(accept).toBeEnabled();
    fireEvent.click(accept);
    await waitFor(() =>
      expect(screen.getByText(/Accepted \d+ suggested binding/i)).toBeInTheDocument(),
    );
    expect(screen.getByText(/system-of-record identifier/i)).toBeInTheDocument();
    expect(screen.getByText(/of \d+/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next/i })).toBeEnabled();

    const remove = screen.getByRole('button', { name: /Remove all suggested/i });
    expect(remove).toBeEnabled();
    fireEvent.click(remove);
    await waitFor(() =>
      expect(screen.getByText(/Removed \d+ suggested binding/i)).toBeInTheDocument(),
    );
    expect(
      screen.getByRole('button', { name: /Accept all suggested/i }),
    ).toBeEnabled();
  });

  it('walks Other source → upload CSV → Bind', async () => {
    renderWorkspace('/workspace/bind-columns?datasetId=DS-CIB-40118');
    await waitFor(() =>
      expect(screen.getByLabelText(/Which dataset are you binding/i)).toHaveValue(
        'DS-CIB-40118',
      ),
    );

    fireEvent.click(screen.getByRole('button', { name: /Other source — manual columns/i }));
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() =>
      expect(screen.getByText(/Auto-harvest isn't available/i)).toBeInTheDocument(),
    );

    const csv = ['column,type,length,nullable,pii', 'acct_id,VARCHAR,20,No,No'].join('\n');
    const file = new File([csv], 'columns.csv', { type: 'text/csv' });
    const input = screen.getByTestId('bind-harvest-file-input');
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() =>
      expect(screen.getByText('acct_id')).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    await waitFor(() =>
      expect(screen.getByText('Ready to publish')).toBeInTheDocument(),
    );
  });

  it('downloads a sample CSV for Other source', async () => {
    renderWorkspace('/workspace/bind-columns?datasetId=DS-CIB-40118');
    await waitFor(() =>
      expect(screen.getByLabelText(/Which dataset are you binding/i)).toHaveValue(
        'DS-CIB-40118',
      ),
    );

    fireEvent.click(screen.getByRole('button', { name: /Other source — manual columns/i }));
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /Download sample data/i }),
      ).toBeInTheDocument(),
    );

    const createObjectURL = vi.fn(() => 'blob:mock');
    const revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});

    fireEvent.click(screen.getByRole('button', { name: /Download sample data/i }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);

    clickSpy.mockRestore();
  });

  it('opens from left nav', async () => {
    renderWorkspace('/workspace');
    await waitFor(() =>
      expect(screen.getByTestId('workspace-shell')).toBeInTheDocument(),
    );

    await waitFor(() => {
      const nav = screen.getByLabelText('Workspace');
      expect(within(nav).getByRole('button', { name: 'Bind columns' })).toBeEnabled();
    });

    const nav = screen.getByLabelText('Workspace');
    fireEvent.click(within(nav).getByRole('button', { name: 'Bind columns' }));

    await waitFor(() =>
      expect(screen.getByTestId('bind-columns')).toBeInTheDocument(),
    );
  });

  it('deep-links with datasetId', async () => {
    renderWorkspace('/workspace/bind-columns?datasetId=DS-CIB-40118');
    await waitFor(() =>
      expect(screen.getByTestId('bind-columns')).toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(screen.getByLabelText(/Which dataset are you binding/i)).toHaveValue(
        'DS-CIB-40118',
      ),
    );
    expect(screen.getByText('OFR-CIB-0007')).toBeInTheDocument();
  });
});
