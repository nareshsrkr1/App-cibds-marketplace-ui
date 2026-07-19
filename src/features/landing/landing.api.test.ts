import { afterEach, describe, expect, it } from 'vitest';
import { setMockFetchMode } from '../../app/apiClient';
import { fetchLandingProofStats } from './landing.api';

afterEach(() => {
  setMockFetchMode('success');
});

describe('fetchLandingProofStats', () => {
  it('returns five proof stats from mock fixture', async () => {
    setMockFetchMode('success');
    const res = await fetchLandingProofStats();
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.stats).toHaveLength(5);
      expect(res.data.stats[0]).toEqual({ value: '6', label: 'Physical datasets' });
      expect(res.data.stats.map((s) => s.label)).toContain('Business terms');
    }
  });

  it('returns empty stats list in empty mode', async () => {
    setMockFetchMode('empty');
    const res = await fetchLandingProofStats();
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.stats).toEqual([]);
    }
  });
});
