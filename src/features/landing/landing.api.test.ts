import { afterEach, describe, expect, it } from 'vitest';
import { getApiBaseUrl, getApiMode, shouldStartMsw } from '../../app/api/apiConfig';
import { resetAppConfig, setAppConfig } from '../../app/config/appConfig';
import {
  setLandingMockDelay,
  setLandingMockScenario,
} from '../../mocks/landing/handlers';
import { fetchLandingMetrics, LANDING_METRICS_RESOURCE } from './landing.api';

afterEach(() => {
  setLandingMockScenario('success');
  setLandingMockDelay(280);
  resetAppConfig();
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
      expect(res.data.stats.map((s) => s.label)).toContain('Glossary terms');
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

  it('supports phased resource modes via runtime app config', () => {
    expect(getApiMode(LANDING_METRICS_RESOURCE)).toBe('mock');
    expect(getApiBaseUrl(LANDING_METRICS_RESOURCE)).toBe('');
    expect(shouldStartMsw()).toBe(true);

    // Phase: landing real, default still mock (notifications etc. stay mocked)
    setAppConfig({
      api: {
        defaultMode: 'mock',
        baseUrl: 'https://api.example.com',
        resources: {
          landingMetrics: { mode: 'real' },
        },
      },
    });
    expect(getApiMode(LANDING_METRICS_RESOURCE)).toBe('real');
    expect(getApiBaseUrl(LANDING_METRICS_RESOURCE)).toBe('https://api.example.com');
    expect(getApiMode('notifications')).toBe('mock');
    expect(shouldStartMsw()).toBe(true);

    // Final phase: all real
    setAppConfig({
      api: {
        defaultMode: 'real',
        baseUrl: 'https://api.example.com',
        resources: {},
      },
    });
    expect(getApiMode(LANDING_METRICS_RESOURCE)).toBe('real');
    expect(shouldStartMsw()).toBe(false);
  });
});
