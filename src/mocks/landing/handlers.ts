import { delay, http, HttpResponse } from 'msw';
import { API_ENDPOINTS } from '../../api';
import metrics from './metrics.json';

export type LandingMockScenario = 'success' | 'empty' | 'error' | 'delayed';

let scenario: LandingMockScenario = 'success';
let delayMs = 280;

export function setLandingMockScenario(next: LandingMockScenario) {
  scenario = next;
}

export function setLandingMockDelay(ms: number) {
  delayMs = ms;
}

export function getLandingMockScenario() {
  return scenario;
}

export const LANDING_METRICS_URL = API_ENDPOINTS.landingMetrics.path;

/** Wildcard so jsdom (absolute origin) and relative browser fetches both match. */
export const landingHandlers = [
  http.get(`*${LANDING_METRICS_URL}`, async () => {
    if (scenario === 'delayed' || scenario === 'success') {
      await delay(scenario === 'delayed' ? delayMs : 0);
    }

    if (scenario === 'error') {
      return HttpResponse.json(
        {
          code: 'LANDING_METRICS_UNAVAILABLE',
          message: 'Unable to retrieve landing metrics.',
        },
        { status: 500 },
      );
    }

    if (scenario === 'empty') {
      return HttpResponse.json({ stats: [] });
    }

    return HttpResponse.json(metrics);
  }),
];
