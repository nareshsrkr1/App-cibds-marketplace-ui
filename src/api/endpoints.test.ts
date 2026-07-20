import { describe, expect, it } from 'vitest';
import {
  API_ENDPOINTS,
  listPlannedEndpoints,
  listWiredEndpoints,
  withPersonaQuery,
} from './endpoints';

describe('API_ENDPOINTS catalog', () => {
  it('lists wired console and session APIs used by the UI today', () => {
    const wired = listWiredEndpoints().map((e) => e.id);
    expect(wired).toEqual(
      expect.arrayContaining([
        'landingMetrics',
        'landingContent',
        'sessionContext',
        'workspaceNav',
        'workspaceConsoleHero',
        'workspaceConsoleCharts',
        'workspaceConsoleSubRequests',
        'workspaceConsoleConsumers',
        'workspaceConsoleGovernance',
      ]),
    );
  });

  it('reserves planned catalogue endpoints without wiring them', () => {
    const planned = listPlannedEndpoints().map((e) => e.id);
    expect(planned).toEqual(
      expect.arrayContaining(['notifications', 'datasets', 'businessTerms', 'governance', 'search']),
    );
    expect(API_ENDPOINTS.datasets.wired).toBe(false);
  });

  it('builds persona query consistently', () => {
    expect(withPersonaQuery('/api/v1/workspace/console/hero', 'PRODUCER')).toBe(
      '/api/v1/workspace/console/hero?persona=PRODUCER',
    );
  });
});
