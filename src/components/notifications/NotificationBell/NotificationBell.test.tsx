/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import {
  __getNotificationSeed,
  __resetNotificationsForTests,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from '../../../services/notificationService';
import { NotificationBell } from './NotificationBell';

beforeEach(() => {
  __resetNotificationsForTests(__getNotificationSeed());
});

afterEach(() => {
  __resetNotificationsForTests(__getNotificationSeed());
});

describe('notificationService (JSON seed)', () => {
  it('loads unread counts from notifications.json', () => {
    const seed = __getNotificationSeed();
    expect(seed.length).toBeGreaterThan(0);
    expect(getUnreadCount()).toBe(seed.filter((n) => !n.read).length);
  });

  it('marks one notification as read', () => {
    const initial = getUnreadCount();
    markAsRead('n1');
    expect(getUnreadCount()).toBe(initial - 1);
  });

  it('marks all notifications as read', () => {
    markAllAsRead();
    expect(getUnreadCount()).toBe(0);
  });
});

describe('NotificationBell drawer', () => {
  it('switches between Unread and All tabs', () => {
    render(<NotificationBell />);
    fireEvent.click(screen.getByRole('button', { name: /Notifications/i }));

    const dialog = screen.getByRole('dialog', { name: 'Notifications' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    const unreadTab = screen.getByRole('tab', { name: 'Unread' });
    const allTab = screen.getByRole('tab', { name: 'All' });
    expect(unreadTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Welcome to Data Marketplace')).toBeInTheDocument();
    expect(screen.queryByText('Workspace still disabled')).not.toBeInTheDocument();

    fireEvent.click(allTab);
    expect(allTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Workspace still disabled')).toBeInTheDocument();
    expect(screen.getByText('Welcome to Data Marketplace')).toBeInTheDocument();

    fireEvent.click(unreadTab);
    expect(unreadTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByText('Workspace still disabled')).not.toBeInTheDocument();
  });

  it('marks one notification as read from the panel', () => {
    render(<NotificationBell />);
    fireEvent.click(screen.getByRole('button', { name: /Notifications/i }));

    const item = screen.getByText('Welcome to Data Marketplace').closest('li');
    expect(item).not.toBeNull();
    fireEvent.click(
      within(item as HTMLElement).getByRole('button', { name: /Mark as read/i }),
    );

    expect(getUnreadCount()).toBe(
      __getNotificationSeed().filter((n) => !n.read).length - 1,
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Unread' }));
    expect(screen.queryByText('Welcome to Data Marketplace')).not.toBeInTheDocument();
  });

  it('marks all as read and shows empty unread state', () => {
    render(<NotificationBell />);
    fireEvent.click(screen.getByRole('button', { name: /Notifications/i }));
    fireEvent.click(screen.getByRole('button', { name: /Mark all as read/i }));

    expect(getUnreadCount()).toBe(0);
    expect(screen.getByText('No unread notifications')).toBeInTheDocument();
    expect(screen.getByText('You are all caught up.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'All' }));
    expect(screen.getByText('Welcome to Data Marketplace')).toBeInTheDocument();
  });

  it('shows empty All state when there are no notifications', () => {
    __resetNotificationsForTests([]);
    render(<NotificationBell />);
    fireEvent.click(screen.getByRole('button', { name: /^Notifications$/i }));
    fireEvent.click(screen.getByRole('tab', { name: 'All' }));
    expect(screen.getByText('No notifications')).toBeInTheDocument();
  });

  it('moves focus into the drawer on open and returns it to the bell on Escape', () => {
    render(<NotificationBell />);
    const bell = screen.getByRole('button', { name: /Notifications/i });
    bell.focus();
    expect(bell).toHaveFocus();

    fireEvent.click(bell);
    const dialog = screen.getByRole('dialog', { name: 'Notifications' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog.contains(document.activeElement)).toBe(true);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(
      screen.queryByRole('dialog', { name: 'Notifications' }),
    ).not.toBeInTheDocument();
    expect(bell).toHaveFocus();
  });

  it('keeps Tab focus trapped inside the open drawer', () => {
    render(<NotificationBell />);
    fireEvent.click(screen.getByRole('button', { name: /Notifications/i }));

    const dialog = screen.getByRole('dialog', { name: 'Notifications' });
    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    );
    expect(focusable.length).toBeGreaterThan(1);

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    last.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(first).toHaveFocus();

    first.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(last).toHaveFocus();
  });
});
