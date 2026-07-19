import seed from '../mocks/notifications.json';

export type NotificationCategory =
  | 'Information'
  | 'Success'
  | 'Warning'
  | 'Action required'
  | 'System notice';

export type AppNotification = {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  href?: string;
};

type Listener = (items: AppNotification[]) => void;

const notificationSeed = seed as AppNotification[];

let items: AppNotification[] = notificationSeed.map((n) => ({ ...n }));
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener(items);
}

export function subscribeNotifications(listener: Listener) {
  listeners.add(listener);
  listener(items);
  return () => {
    listeners.delete(listener);
  };
}

export function getNotifications() {
  return items;
}

export function getUnreadCount() {
  return items.filter((n) => !n.read).length;
}

export function markAsRead(id: string) {
  items = items.map((n) => (n.id === id ? { ...n, read: true } : n));
  emit();
}

export function markAllAsRead() {
  items = items.map((n) => ({ ...n, read: true }));
  emit();
}

/** Test helper — reset to JSON seed (or a provided list). */
export function __resetNotificationsForTests(next: AppNotification[] = notificationSeed) {
  items = next.map((n) => ({ ...n }));
  emit();
}

export function __getNotificationSeed(): AppNotification[] {
  return notificationSeed.map((n) => ({ ...n }));
}
