/**
 * Mock latency controlled by src/mocks/mockDelay.ts (default 0).
 */
import { delay, http, HttpResponse } from 'msw';
import { API_ENDPOINTS } from '../../api';
import { getMockResponseDelay } from '../mockDelay';
import content from './content.json';
import metrics from './metrics.json';

export type LandingMockScenario = 'success' | 'empty' | 'error' | 'delayed';

let scenario: LandingMockScenario = 'success';
/** Legacy per-handler delay; prefer getMockResponseDelay(). */
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
export const LANDING_CONTENT_URL = API_ENDPOINTS.landingContent.path;

async function applyLatency(useLegacyDelayed = false) {
  if (useLegacyDelayed) {
    await delay(delayMs);
    return;
  }
  const ms = getMockResponseDelay();
  if (ms > 0) await delay(ms);
}

/** Wildcard so jsdom (absolute origin) and relative browser fetches both match. */
export const landingHandlers = [
  http.get(`*${LANDING_METRICS_URL}`, async () => {
    if (scenario === 'error') {
      return HttpResponse.json(
        {
          code: 'LANDING_METRICS_UNAVAILABLE',
          message: 'Unable to retrieve landing metrics.',
        },
        { status: 500 },
      );
    }
    await applyLatency(scenario === 'delayed');
    if (scenario === 'empty') {
      return HttpResponse.json({ stats: [] });
    }
    return HttpResponse.json(metrics);
  }),

  http.get(`*${LANDING_CONTENT_URL}`, async () => {
    if (scenario === 'error') {
      return HttpResponse.json(
        {
          code: 'LANDING_CONTENT_UNAVAILABLE',
          message: 'Unable to retrieve landing content.',
        },
        { status: 500 },
      );
    }
    await applyLatency(scenario === 'delayed');
    if (scenario === 'empty') {
      return HttpResponse.json({
        diagram: [],
        capabilities: [],
        pipeline: [],
        faqs: [],
      });
    }
    return HttpResponse.json(content);
  }),
];
