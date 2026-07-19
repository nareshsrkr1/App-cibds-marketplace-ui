import type { ApiResourceId } from '../app/api/api.types';

/**
 * Central contract for every marketplace HTTP API the UI knows about.
 *
 * - `wired: true`  → feature code calls this today (served by MSW when mode=mock,
 *                    or by the real backend when mode=real + API_BASE_URL).
 * - `wired: false` → reserved for a future story; path/resource id are fixed so
 *                    config and mocks can be added without renaming later.
 *
 * Flip a resource to real in config/env-local.properties — do not delete mocks
 * until that resource (and tests) no longer need MSW.
 */
export type ApiEndpointDef = {
  /** Stable id used in app-config `resources` and httpClient. */
  id: ApiResourceId;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Path relative to API base (mock = same-origin; real = API_BASE_URL). */
  path: string;
  wired: boolean;
  summary: string;
};

export const API_ENDPOINTS = {
  landingMetrics: {
    id: 'landingMetrics',
    method: 'GET',
    path: '/api/v1/marketplace/landing/metrics',
    wired: true,
    summary: 'Landing page proof-strip metrics',
  },
  sessionContext: {
    id: 'sessionContext',
    method: 'GET',
    path: '/api/v1/session/context',
    wired: true,
    summary: 'Authenticated user, roles, entitlements, personas',
  },
  workspaceConsoleHero: {
    id: 'workspaceConsoleHero',
    method: 'GET',
    path: '/api/v1/workspace/console/hero',
    wired: true,
    summary: 'Producer console hero: eyebrow, subtitle, KPIs, actions (?persona=)',
  },
  workspaceConsoleCharts: {
    id: 'workspaceConsoleCharts',
    method: 'GET',
    path: '/api/v1/workspace/console/charts',
    wired: true,
    summary: 'Producer console statistics charts (?persona=)',
  },
  workspaceConsoleSubRequests: {
    id: 'workspaceConsoleSubRequests',
    method: 'GET',
    path: '/api/v1/workspace/console/subscription-requests',
    wired: true,
    summary: 'Subscription requests awaiting approval (?persona=)',
  },
  workspaceConsoleGovernance: {
    id: 'workspaceConsoleGovernance',
    method: 'GET',
    path: '/api/v1/workspace/console/governance',
    wired: true,
    summary: 'Items sent to governance (?persona=)',
  },

  /* —— Planned (not wired in UI yet) —— */
  notifications: {
    id: 'notifications',
    method: 'GET',
    path: '/api/v1/notifications',
    wired: false,
    summary: 'In-app notification feed',
  },
  datasets: {
    id: 'datasets',
    method: 'GET',
    path: '/api/v1/datasets',
    wired: false,
    summary: 'Dataset catalogue list',
  },
  businessTerms: {
    id: 'businessTerms',
    method: 'GET',
    path: '/api/v1/business-terms',
    wired: false,
    summary: 'Business term glossary',
  },
  governance: {
    id: 'governance',
    method: 'GET',
    path: '/api/v1/governance/queue',
    wired: false,
    summary: 'Governance work queue',
  },
  search: {
    id: 'search',
    method: 'GET',
    path: '/api/v1/search',
    wired: false,
    summary: 'Global marketplace search (?q=)',
  },
} as const satisfies Record<string, ApiEndpointDef>;

export type ApiEndpointKey = keyof typeof API_ENDPOINTS;

export function listWiredEndpoints(): ApiEndpointDef[] {
  return Object.values(API_ENDPOINTS).filter((e) => e.wired);
}

export function listPlannedEndpoints(): ApiEndpointDef[] {
  return Object.values(API_ENDPOINTS).filter((e) => !e.wired);
}

/** Append query string for persona-scoped console APIs. */
export function withPersonaQuery(path: string, persona: string): string {
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}persona=${encodeURIComponent(persona)}`;
}
