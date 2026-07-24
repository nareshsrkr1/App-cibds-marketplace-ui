import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import {
  markAllAsRead,
  markAsRead,
  subscribeNotifications,
  type AppNotification,
} from '../../../services/notificationService';
import { EmptyState } from '../../feedback/EmptyState/EmptyState';
import { Badge } from '../../ui/Badge/Badge';
import { Button } from '../../ui/Button/Button';

export type NotificationPanelProps = {
  onClose: () => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
};

type Tab = 'unread' | 'all';

/** Items beyond this many are hidden behind a local "Show more" reveal — forward cover for
 * real notification volumes; today's seed data never hits this. */
const PAGE_SIZE = 20;

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function toneFor(category: AppNotification['category']) {
  switch (category) {
    case 'Success':
      return 'success' as const;
    case 'Warning':
      return 'warning' as const;
    case 'Action required':
      return 'danger' as const;
    case 'System notice':
      return 'info' as const;
    default:
      return 'neutral' as const;
  }
}

export function NotificationPanel({ onClose, returnFocusRef }: NotificationPanelProps) {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [tab, setTab] = useState<Tab>('unread');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => subscribeNotifications(setItems), []);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const focusables = () => Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
    const initial = focusables()[0] ?? panel;
    initial.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;
      const nodes = focusables();
      if (nodes.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      // Intentionally read `.current` at cleanup time (not captured earlier) so
      // focus returns to whatever element the ref points to when the panel closes.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      returnFocusRef?.current?.focus();
    };
  }, [onClose, returnFocusRef]);

  const filtered = useMemo(
    () => (tab === 'unread' ? items.filter((n) => !n.read) : items),
    [items, tab],
  );
  useEffect(() => setVisibleCount(PAGE_SIZE), [tab]);
  const visible = filtered.slice(0, visibleCount);
  const remaining = filtered.length - visible.length;

  return (
    <aside
      ref={panelRef}
      className="notif-panel"
      role="dialog"
      aria-modal="true"
      aria-label="Notifications"
      tabIndex={-1}
    >
      <div className="notif-panel__header">
        <strong>Notifications</strong>
        <div className="notif-panel__actions">
          <Button type="button" variant="ghost" size="sm" onClick={() => markAllAsRead()}>
            Mark all as read
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Close notifications"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
      <div className="notif-panel__tabs" role="tablist" aria-label="Notification filters">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          role="tab"
          aria-selected={tab === 'unread'}
          onClick={() => setTab('unread')}
        >
          Unread
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          role="tab"
          aria-selected={tab === 'all'}
          onClick={() => setTab('all')}
        >
          All
        </Button>
      </div>
      {visible.length === 0 ? (
        <EmptyState
          title={tab === 'unread' ? 'No unread notifications' : 'No notifications'}
          description="You are all caught up."
        />
      ) : (
        <ul className="notif-list">
          {visible.map((n) => (
            <li
              key={n.id}
              className={['notif-item', n.read ? '' : 'notif-item--unread']
                .filter(Boolean)
                .join(' ')}
            >
              <div className="notif-item__top">
                <Badge tone={toneFor(n.category)}>{n.category}</Badge>
                {!n.read ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(n.id)}
                  >
                    Mark as read
                  </Button>
                ) : null}
              </div>
              <strong>{n.title}</strong>
              <p>{n.message}</p>
              <div className="notif-item__meta">
                <time dateTime={n.timestamp}>
                  {new Date(n.timestamp).toLocaleString()}
                </time>
              </div>
            </li>
          ))}
          {remaining > 0 ? (
            <li className="notif-list__more">
              <button
                type="button"
                className="sh-show-more"
                onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
              >
                Show {Math.min(remaining, PAGE_SIZE)} more
              </button>
            </li>
          ) : null}
        </ul>
      )}
    </aside>
  );
}
