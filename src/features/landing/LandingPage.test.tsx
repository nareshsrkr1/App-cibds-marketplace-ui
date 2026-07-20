/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { setLandingMockScenario } from '../../mocks/landing/handlers';
import { setSessionMockScenario } from '../../mocks/workspace/handlers';
import { LandingPage } from './LandingPage';

afterEach(() => {
  setLandingMockScenario('success');
  setSessionMockScenario('success');
});

function renderLanding() {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  );
}

describe('LandingPage', () => {
  it('renders brand, hero, and section anchors from the HTML reference', async () => {
    setLandingMockScenario('success');
    renderLanding();
    expect(screen.getByText('CIB Data Services')).toBeInTheDocument();
    expect(screen.getAllByText('Data Marketplace').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Data that moves the/i);
    expect(screen.getByRole('link', { name: 'Capabilities' })).toHaveAttribute('href', '#pl-cap');
    expect(screen.getByRole('link', { name: 'How it works' })).toHaveAttribute('href', '#pl-how');
    expect(screen.getByRole('link', { name: 'FAQ' })).toHaveAttribute('href', '#pl-faq');
    await waitFor(() => {
      expect(screen.getByText('Physical datasets')).toBeInTheDocument();
    });
    expect(screen.getByText('Six reasons data moves with confidence.')).toBeInTheDocument();
    expect(screen.getByText('Frequently asked questions.')).toBeInTheDocument();
  });

  it('keeps catalogue CTAs disabled and enables Workspace after Admin context loads', async () => {
    setLandingMockScenario('success');
    setSessionMockScenario('success');
    renderLanding();
    const browseButtons = screen.getAllByRole('button', { name: /Browse/i });
    for (const btn of browseButtons) {
      expect(btn).toBeDisabled();
    }
    await waitFor(() => {
      const workspaceButtons = screen.getAllByRole('button', { name: /Open workspace/i });
      for (const btn of workspaceButtons) {
        expect(btn).not.toBeDisabled();
      }
    });
  });

  it('keeps Workspace disabled when user lacks WORKSPACE_VIEW', async () => {
    setSessionMockScenario('noWorkspace');
    renderLanding();
    await waitFor(() => {
      const workspaceButtons = screen.getAllByRole('button', { name: /Open workspace/i });
      for (const btn of workspaceButtons) {
        expect(btn).toBeDisabled();
      }
    });
  });

  it('shows proof strip from mock API when metrics resolve', async () => {
    setLandingMockScenario('success');
    renderLanding();
    expect(screen.queryByText('Physical datasets')).not.toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Physical datasets')).toBeInTheDocument();
      expect(screen.getByText('68')).toBeInTheDocument();
    });
  });

  it('shows themed empty state when mock returns no stats', async () => {
    setLandingMockScenario('empty');
    renderLanding();
    await waitFor(() => {
      expect(screen.getByText(/No marketplace metrics available yet/i)).toBeInTheDocument();
    });
    expect(screen.queryByText('Physical datasets')).not.toBeInTheDocument();
  });

  it('shows themed error state when mock fails', async () => {
    setLandingMockScenario('error');
    renderLanding();
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Unable to retrieve landing metrics/i);
    });
  });

  it('toggles FAQ accordion open and closed', async () => {
    setLandingMockScenario('success');
    renderLanding();
    const faq = await screen.findByRole('button', {
      name: /What is the difference between a glossary term/i,
    });
    expect(faq).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(faq);
    expect(faq).toHaveAttribute('aria-expanded', 'true');
    expect(faq.closest('.pl-faq-item')?.className).toContain('open');
    fireEvent.click(faq);
    expect(faq).toHaveAttribute('aria-expanded', 'false');
  });
});
