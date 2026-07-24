import { useEffect, useRef, useState } from 'react';
import {
  getUnreadCount,
  subscribeNotifications,
} from '../../../services/notificationService';
import { NotificationPanel } from '../NotificationPanel/NotificationPanel';

export type NotificationBellProps = { label?: string };

function BellIcon() {
  return (
    <svg
      className="notif-bell__icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 22a2.25 2.25 0 0 0 2.25-2.25h-4.5A2.25 2.25 0 0 0 12 22Zm7.5-6.75V11a7.5 7.5 0 1 0-15 0v4.25L3 16.75V18h18v-1.25l-1.5-1.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function NotificationBell({ label = 'Notifications' }: NotificationBellProps) {
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => subscribeNotifications(() => setUnread(getUnreadCount())), []);

  return (
    <div className="notif-bell">
      <button
        ref={buttonRef}
        type="button"
        className="notif-bell__btn"
        aria-label={unread > 0 ? `${label}, ${unread} unread` : label}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
      >
        <BellIcon />
        {unread > 0 ? (
          <span className="notif-bell__count" aria-hidden="true" key={unread}>
            {unread}
          </span>
        ) : null}
      </button>
      {open ? (
        <NotificationPanel onClose={() => setOpen(false)} returnFocusRef={buttonRef} />
      ) : null}
    </div>
  );
}
