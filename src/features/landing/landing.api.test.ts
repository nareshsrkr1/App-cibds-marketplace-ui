import { afterEach, describe, expect, it, vi } from 'vitest';
import { getApiBaseUrl, getApiMode } from '../../app/api/apiConfig';
import {
  setLandingMockDelay,
  setLandingMockScenario,
} from '../../mocks/landing/handlers';
import { fetchLandingMetrics } from './landing.api';

afterEach(() => {
  setLandingMockScenario('success');
  setLandingMockDelay(280);
  vi.unstubAllEnvs();
});

describe('fetchLandingMetrics', () => {
  it('returns five metrics from MSW success fixture', async () => {
    setLandingMockScenario('success');
    const res = await fetchLandingMetrics();
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.stats).toHaveLength(5);
      expect(res.data.stats[0]).toEqual({
        key: 'physical-datasets',
        value: 6,
        label: 'Physical datasets',
      });
      expect(res.data.stats.map((s) => s.label)).toContain('Business terms');
    }
  });

  it('returns empty stats list in empty mode', async () => {
    setLandingMockScenario('empty');
    const res = await fetchLandingMetrics();
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.stats).toEqual([]);
    }
  });

  it('returns API error payload on 500', async () => {
    setLandingMockScenario('error');
    const res = await fetchLandingMetrics();
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toMatch(/Unable to retrieve landing metrics/i);
      expect(res.code).toBe('LANDING_METRICS_UNAVAILABLE');
      expect(res.status).toBe(500);
    }
  });

  it('supports delayed responses for loading-state testing', async () => {
    setLandingMockScenario('delayed');
    setLandingMockDelay(50);
    const started = Date.now();
    const res = await fetchLandingMetrics();
    expect(Date.now() - started).toBeGreaterThanOrEqual(40);
    expect(res.ok).toBe(true);
  });

  it('selects mock mode by default and real mode via env', () => {
    expect(getApiMode()).toBe('mock');
    expect(getApiBaseUrl('landing')).toBe('');

    vi.stubEnv('VITE_API_MODE', 'real');
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com');
    expect(getApiMode()).toBe('real');
    expect(getApiBaseUrl('landing')).toBe('https://api.example.com');

    vi.stubEnv('VITE_LANDING_API_MODE', 'mock');
    expect(getApiMode('landing')).toBe('mock');
    expect(getApiBaseUrl('landing')).toBe('');
  });
});
