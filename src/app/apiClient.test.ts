import { afterEach, describe, expect, it } from 'vitest';
import { apiGet, getMockFetchMode, setMockFetchMode } from './apiClient';

afterEach(() => {
  setMockFetchMode('success');
});

describe('apiClient', () => {
  it('returns fixture data in success mode', async () => {
    setMockFetchMode('success');
    const res = await apiGet('/mock/x', { n: 1 }, { n: 0 });
    expect(res).toEqual({ ok: true, data: { n: 1 } });
    expect(getMockFetchMode()).toBe('success');
  });

  it('returns empty fixture in empty mode', async () => {
    setMockFetchMode('empty');
    const res = await apiGet('/mock/x', { n: 1 }, { n: 0 });
    expect(res).toEqual({ ok: true, data: { n: 0 } });
  });

  it('returns error in error mode', async () => {
    setMockFetchMode('error');
    const res = await apiGet('/mock/x', { n: 1 }, { n: 0 });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain('/mock/x');
    }
  });
});
