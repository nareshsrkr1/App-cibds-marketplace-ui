/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { ToastProvider } from '../../../components/feedback/Toast/ToastProvider';
import {
  setConsoleMockScenario,
  setSessionMockScenario,
} from '../../../mocks/workspace/handlers';
import { SessionProvider } from '../../session/SessionProvider';
import { __resetToastsForTests } from '../../../services/toastService';
import { BulkUploadPdesPage } from './BulkUploadPdesPage';
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
            <Route path="bulk-upload-pdes" element={<BulkUploadPdesPage />} />
          </Route>
        </Routes>
        <ToastProvider />
      </SessionProvider>
    </MemoryRouter>,
  );
}

describe('Bulk upload PDEs', () => {
  it('opens from hero CTA; sample load is validation-only (no Register)', async () => {
    renderWorkspace('/workspace');
    await waitFor(() =>
      expect(screen.getByTestId('producer-console')).toBeInTheDocument(),
    );

    const heroBulk = within(screen.getByTestId('producer-console')).getByRole(
      'button',
      { name: 'Bulk upload PDEs' },
    );
    fireEvent.click(heroBulk);
    await waitFor(() =>
      expect(screen.getByTestId('bulk-upload-pdes')).toBeInTheDocument(),
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /Bulk upload PDEs/i,
    );

    await waitFor(() =>
      expect(screen.getByLabelText(/Application/i)).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByLabelText(/Application/i), {
      target: { value: 'endur' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Preview sample data/i }));

    await waitFor(() =>
      expect(screen.getByText('need fixing')).toBeInTheDocument(),
    );
    expect(screen.getByText('fx_deal_id')).toBeInTheDocument();
    expect(
      screen.getByText(/Sample preview — validation only/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Register \d+ valid PDE/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Upload a CSV to register/i }),
    ).toBeInTheDocument();
  });

  it('opens from left nav and requires application before upload', async () => {
    renderWorkspace('/workspace');
    await waitFor(() =>
      expect(screen.getByTestId('workspace-shell')).toBeInTheDocument(),
    );

    await waitFor(() => {
      const nav = screen.getByLabelText('Workspace');
      expect(within(nav).getByRole('button', { name: 'Bulk upload PDEs' })).toBeEnabled();
    });

    const nav = screen.getByLabelText('Workspace');
    fireEvent.click(within(nav).getByRole('button', { name: 'Bulk upload PDEs' }));

    await waitFor(() =>
      expect(screen.getByTestId('bulk-upload-pdes')).toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(screen.getByLabelText(/Application/i)).toBeInTheDocument(),
    );

    const drop = screen.getByRole('button', {
      name: /Drop a PDE CSV here, or click to browse/i,
    });
    expect(drop).toHaveAttribute('aria-disabled', 'true');
    expect(
      screen.getByText(/Select an application first to upload a CSV/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Preview sample data/i })).toBeDisabled();
  });

  it('parses a dropped CSV into the review table', async () => {
    renderWorkspace('/workspace/bulk-upload-pdes');
    await waitFor(() =>
      expect(screen.getByLabelText(/Application/i)).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByLabelText(/Application/i), {
      target: { value: 'endur' },
    });

    const csv = [
      'dataset,column,type,length,nullable,pii,sourceMapping,validValues,description',
      'My Dataset,acct_id,VARCHAR,20,No,No,SRC.ACCT,,Account id',
    ].join('\n');
    const file = new File([csv], 'pdes.csv', { type: 'text/csv' });
    const input = screen.getByTestId('bulk-pde-file-input');
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(screen.getByText('acct_id')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /Register 1 valid PDE/i })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: /Register 1 valid PDE/i }));
    await waitFor(() =>
      expect(screen.getByText(/PDEs registered across/i)).toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: /Bind these now/i })).toBeInTheDocument();
  });

  it('deep-links to /workspace/bulk-upload-pdes', async () => {
    renderWorkspace('/workspace/bulk-upload-pdes');
    await waitFor(() =>
      expect(screen.getByTestId('bulk-upload-pdes')).toBeInTheDocument(),
    );
    await waitFor(() => expect(screen.getByText('Endur')).toBeInTheDocument());
  });
});
