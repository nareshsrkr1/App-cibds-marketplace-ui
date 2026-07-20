/** Local wall-clock day part for console greetings. */
export function dayPartLabel(
  now: Date = new Date(),
): 'morning' | 'afternoon' | 'evening' {
  const hour = now.getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

/** e.g. "Good morning, Test." — name from session/API, period from system clock. */
export function personalizedGreeting(
  displayName: string,
  now: Date = new Date(),
): string {
  const first = displayName.trim().split(/\s+/)[0] || 'there';
  return `Good ${dayPartLabel(now)}, ${first}.`;
}
