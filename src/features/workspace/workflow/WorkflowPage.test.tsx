/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { ToastProvider } from '../../../components/feedback/Toast/ToastProvider';
import {
  setConsoleMockScenario,
  setSessionMockScenario,
} from '../../../api/mock/handlers/workspace.handlers';
import { SessionProvider } from '../../session/SessionProvider';
import { __resetToastsForTests } from '../../../services/toastService';
import { WorkspaceConsolePage } from '../WorkspaceConsolePage';
import { WorkspacePage } from '../WorkspacePage';
import { WorkflowPage } from './WorkflowPage';

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
            <Route path="workflow" element={<WorkflowPage />} />
          </Route>
        </Routes>
        <ToastProvider />
      </SessionProvider>
    </MemoryRouter>,
  );
}

describe('Producer workflow', () => {
  it('keeps hero Track workflow and left-nav Workflow disabled in this rollout', async () => {
    renderWorkspace('/workspace');
    await waitFor(() =>
      expect(screen.getByTestId('producer-console')).toBeInTheDocument(),
    );

    const heroWorkflow = within(screen.getByTestId('producer-console')).getByRole(
      'button',
      { name: 'Track workflow' },
    );
    expect(heroWorkflow).toBeDisabled();

    await waitFor(() => {
      const nav = screen.getByLabelText('Workspace');
      expect(within(nav).getByRole('button', { name: 'Workflow' })).toBeDisabled();
    });

    fireEvent.click(heroWorkflow);
    expect(screen.queryByTestId('workflow-page')).not.toBeInTheDocument();
  });

  it('still renders the board when mounted directly (component coverage)', async () => {
    renderWorkspace('/workspace/workflow');
    await waitFor(() =>
      expect(screen.getByText('Market Risk · Risk Analytics')).toBeInTheDocument(),
    );

    const approveButtons = screen.getAllByRole('button', { name: 'Approve' });
    const declineButtons = screen.getAllByRole('button', { name: 'Decline' });
    expect(approveButtons.length).toBeGreaterThan(0);
    for (const btn of approveButtons) {
      expect(btn).toBeDisabled();
    }
    for (const btn of declineButtons) {
      expect(btn).toBeDisabled();
    }
  });
});
