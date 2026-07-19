/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { setMockFetchMode } from '../../app/apiClient';
import { LandingPage } from './LandingPage';

afterEach(() => {
  setMockFetchMode('success');
});

describe('LandingPage', () => {
  it('renders brand, hero, and section anchors from the HTML reference', async () => {
    setMockFetchMode('success');
    render(<LandingPage />);
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

  it('disables out-of-scope catalogue and workspace CTAs', async () => {
    setMockFetchMode('success');
    render(<LandingPage />);
    const browseButtons = screen.getAllByRole('button', { name: /Browse/i });
    const workspaceButtons = screen.getAllByRole('button', { name: /Open workspace/i });
    for (const btn of [...browseButtons, ...workspaceButtons]) {
      expect(btn).toBeDisabled();
    }
    await waitFor(() => expect(screen.getByText('Business terms')).toBeInTheDocument());
  });

  it('shows loading then ready proof strip from mock API', async () => {
    setMockFetchMode('success');
    render(<LandingPage />);
    expect(screen.getByRole('status')).toHaveTextContent(/Loading marketplace metrics/i);
    await waitFor(() => {
      expect(screen.getByText('Physical datasets')).toBeInTheDocument();
      expect(screen.getByText('68')).toBeInTheDocument();
    });
  });

  it('shows themed empty state when mock returns no stats', async () => {
    setMockFetchMode('empty');
    render(<LandingPage />);
    await waitFor(() => {
      expect(screen.getByText(/No marketplace metrics available yet/i)).toBeInTheDocument();
    });
    expect(screen.queryByText('Physical datasets')).not.toBeInTheDocument();
  });

  it('shows themed error state when mock fails', async () => {
    setMockFetchMode('error');
    render(<LandingPage />);
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Mock failure/i);
    });
  });

  it('toggles FAQ accordion open and closed', async () => {
    setMockFetchMode('success');
    render(<LandingPage />);
    const faq = screen.getByRole('button', {
      name: /What is the difference between a business term/i,
    });
    expect(faq).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(faq);
    expect(faq).toHaveAttribute('aria-expanded', 'true');
    expect(faq.className).toContain('open');
    fireEvent.click(faq);
    expect(faq).toHaveAttribute('aria-expanded', 'false');
  });
});
