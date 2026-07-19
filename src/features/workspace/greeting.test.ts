import { describe, expect, it } from 'vitest';
import { dayPartLabel, personalizedGreeting } from './greeting';

describe('greeting', () => {
  it('uses morning before noon', () => {
    expect(dayPartLabel(new Date('2026-07-19T08:30:00'))).toBe('morning');
    expect(personalizedGreeting('Test user', new Date('2026-07-19T08:30:00'))).toBe(
      'Good morning, Test.',
    );
  });

  it('uses afternoon from noon until 5pm', () => {
    expect(dayPartLabel(new Date('2026-07-19T14:00:00'))).toBe('afternoon');
    expect(personalizedGreeting('Test user', new Date('2026-07-19T14:00:00'))).toBe(
      'Good afternoon, Test.',
    );
  });

  it('uses evening from 5pm', () => {
    expect(dayPartLabel(new Date('2026-07-19T19:15:00'))).toBe('evening');
    expect(personalizedGreeting('Test user', new Date('2026-07-19T19:15:00'))).toBe(
      'Good evening, Test.',
    );
  });
});
