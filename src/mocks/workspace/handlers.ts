/**
 * Mock latency controlled by src/mocks/mockDelay.ts (default 0).
 */
import { delay, http, HttpResponse } from 'msw';
import { API_ENDPOINTS } from '../../api';
import { personalizedGreeting } from '../../features/workspace/greeting';
import type { WorkspaceNavResponse } from '../../features/workspace/nav.types';
import type {
  ConsoleChartsResponse,
  ConsoleHero,
} from '../../features/workspace/workspace.types';
import { getMockResponseDelay, setMockResponseDelay } from '../mockDelay';
import context from '../session/context.json';
import adminCharts from './admin/charts.json';
import adminHero from './admin/hero.json';
import adminNav from './admin/nav.json';
import consumerCharts from './consumer/charts.json';
import consumerHero from './consumer/hero.json';
import consumerNav from './consumer/nav.json';
import governanceCharts from './governance/charts.json';
import governanceHero from './governance/hero.json';
import governanceNav from './governance/nav.json';
import governanceQueue from './governance/queue.json';
import producerCharts from './producer/charts.json';
import producerConsumers from './producer/consumers.json';
import producerHero from './producer/hero.json';
import producerNav from './producer/nav.json';
import producerSubRequests from './producer/subscription-requests.json';

export type SessionMockScenario = 'success' | 'error' | 'noWorkspace' | 'delayed';
export type ConsoleMockScenario = 'success' | 'empty' | 'error' | 'delayed';
export type ConsoleSectionId =
  'nav' | 'hero' | 'charts' | 'subRequests' | 'consumers' | 'governance';

const ALL_SECTIONS: ConsoleSectionId[] = [
  'nav',
  'hero',
  'charts',
  'subRequests',
  'consumers',
  'governance',
];

let sessionScenario: SessionMockScenario = 'success';
const sectionScenarios: Record<ConsoleSectionId, ConsoleMockScenario> = {
  nav: 'success',
  hero: 'success',
  charts: 'success',
  subRequests: 'success',
  consumers: 'success',
  governance: 'success',
};

/** @deprecated Prefer setMockResponseDelay from mockDelay.ts */
export function setWorkspaceMockDelay(ms: number) {
  setMockResponseDelay(ms);
}

export function setSessionMockScenario(next: SessionMockScenario) {
  sessionScenario = next;
}

export function setConsoleMockScenario(next: ConsoleMockScenario) {
  for (const id of ALL_SECTIONS) {
    sectionScenarios[id] = next;
  }
}

export function setConsoleSectionScenario(
  section: ConsoleSectionId,
  next: ConsoleMockScenario,
) {
  sectionScenarios[section] = next;
}

export const SESSION_CONTEXT_URL = API_ENDPOINTS.sessionContext.path;
export const WORKSPACE_NAV_URL = API_ENDPOINTS.workspaceNav.path;
export const WORKSPACE_CONSOLE_HERO_URL = API_ENDPOINTS.workspaceConsoleHero.path;
export const WORKSPACE_CONSOLE_CHARTS_URL = API_ENDPOINTS.workspaceConsoleCharts.path;
export const WORKSPACE_CONSOLE_SUB_REQUESTS_URL =
  API_ENDPOINTS.workspaceConsoleSubRequests.path;
export const WORKSPACE_CONSOLE_CONSUMERS_URL =
  API_ENDPOINTS.workspaceConsoleConsumers.path;
export const WORKSPACE_CONSOLE_GOVERNANCE_URL =
  API_ENDPOINTS.workspaceConsoleGovernance.path;

function personaFrom(request: Request): string {
  return (new URL(request.url).searchParams.get('persona') ?? 'PRODUCER').toUpperCase();
}

async function applyLatency() {
  const ms = getMockResponseDelay();
  if (ms > 0) await delay(ms);
}

async function applySectionScenario(section: ConsoleSectionId) {
  const scenario = sectionScenarios[section];
  if (scenario === 'error') return scenario;
  await applyLatency();
  return scenario;
}

function sectionError(message: string) {
  return HttpResponse.json(
    {
      code: 'WORKSPACE_CONSOLE_SECTION_UNAVAILABLE',
      message,
    },
    { status: 500 },
  );
}

function withSessionUser<T extends Record<string, unknown>>(payload: T) {
  const displayName = context.user.displayName;
  return {
    ...payload,
    displayName,
    greeting: personalizedGreeting(displayName),
  };
}

// JSON imports are widened to their domain response type — each persona's mock file
// shapes its own union members (e.g. chart `kind`), which literal `typeof` inference
// on a single import can't express for the other three.
const NAV_BY_PERSONA: Record<string, WorkspaceNavResponse> = {
  PRODUCER: producerNav as WorkspaceNavResponse,
  GOVERNANCE: governanceNav as WorkspaceNavResponse,
  CONSUMER: consumerNav as WorkspaceNavResponse,
  ADMIN: adminNav as WorkspaceNavResponse,
};

const HERO_BY_PERSONA: Record<string, ConsoleHero> = {
  PRODUCER: producerHero as ConsoleHero,
  GOVERNANCE: governanceHero as ConsoleHero,
  CONSUMER: consumerHero as ConsoleHero,
  ADMIN: adminHero as ConsoleHero,
};

const CHARTS_BY_PERSONA: Record<string, ConsoleChartsResponse> = {
  PRODUCER: producerCharts as ConsoleChartsResponse,
  GOVERNANCE: governanceCharts as ConsoleChartsResponse,
  CONSUMER: consumerCharts as ConsoleChartsResponse,
  ADMIN: adminCharts as ConsoleChartsResponse,
};

const EMPTY_PANEL = (persona: string, id: string, title: string) => ({
  persona,
  panel: { id, title, moreLabel: 'All', items: [] as unknown[] },
});

export const workspaceHandlers = [
  http.get(`*${SESSION_CONTEXT_URL}`, async () => {
    if (sessionScenario === 'error') {
      return HttpResponse.json(
        {
          code: 'SESSION_CONTEXT_UNAVAILABLE',
          message: 'Unable to retrieve session context.',
        },
        { status: 500 },
      );
    }
    await applyLatency();
    if (sessionScenario === 'noWorkspace') {
      return HttpResponse.json({
        ...context,
        entitlements: [],
        enabledPersonas: [],
      });
    }
    return HttpResponse.json(context);
  }),

  http.get(`*${WORKSPACE_NAV_URL}`, async ({ request }) => {
    const scenario = await applySectionScenario('nav');
    if (scenario === 'error') {
      return sectionError('Unable to retrieve workspace navigation.');
    }
    const persona = personaFrom(request);
    if (scenario === 'empty') {
      return HttpResponse.json({ persona, groups: [] });
    }
    const nav = NAV_BY_PERSONA[persona] ?? NAV_BY_PERSONA.PRODUCER;
    return HttpResponse.json({ ...nav, persona });
  }),

  http.get(`*${WORKSPACE_CONSOLE_HERO_URL}`, async ({ request }) => {
    const scenario = await applySectionScenario('hero');
    if (scenario === 'error') {
      return sectionError('Unable to retrieve console hero.');
    }
    const persona = personaFrom(request);
    const hero = HERO_BY_PERSONA[persona] ?? HERO_BY_PERSONA.PRODUCER;
    if (scenario === 'empty') {
      return HttpResponse.json(
        withSessionUser({
          persona,
          eyebrow: hero.eyebrow,
          subtitle: 'Nothing to show yet.',
          kpis: [],
          actions: [],
        }),
      );
    }
    return HttpResponse.json(withSessionUser({ ...hero, persona }));
  }),

  http.get(`*${WORKSPACE_CONSOLE_CHARTS_URL}`, async ({ request }) => {
    const scenario = await applySectionScenario('charts');
    if (scenario === 'error') {
      return sectionError('Unable to retrieve console charts.');
    }
    const persona = personaFrom(request);
    if (scenario === 'empty') {
      return HttpResponse.json({ persona, tiers: [], charts: [] });
    }
    const charts = CHARTS_BY_PERSONA[persona] ?? { persona, tiers: [], charts: [] };
    return HttpResponse.json({ ...charts, persona });
  }),

  http.get(`*${WORKSPACE_CONSOLE_SUB_REQUESTS_URL}`, async ({ request }) => {
    const scenario = await applySectionScenario('subRequests');
    if (scenario === 'error') {
      return sectionError('Unable to retrieve subscription requests.');
    }
    const persona = personaFrom(request);
    if (scenario === 'empty' || persona !== 'PRODUCER') {
      return HttpResponse.json(
        EMPTY_PANEL(persona, 'subreq', 'Subscription requests · awaiting your approval'),
      );
    }
    return HttpResponse.json({ ...producerSubRequests, persona });
  }),

  http.get(`*${WORKSPACE_CONSOLE_CONSUMERS_URL}`, async ({ request }) => {
    const scenario = await applySectionScenario('consumers');
    if (scenario === 'error') {
      return sectionError('Unable to retrieve consumers.');
    }
    const persona = personaFrom(request);
    if (scenario === 'empty' || persona !== 'PRODUCER') {
      return HttpResponse.json(
        EMPTY_PANEL(persona, 'consumers', 'My consumers · last delivery & SLA'),
      );
    }
    return HttpResponse.json({ ...producerConsumers, persona });
  }),

  http.get(`*${WORKSPACE_CONSOLE_GOVERNANCE_URL}`, async ({ request }) => {
    const scenario = await applySectionScenario('governance');
    if (scenario === 'error') {
      return sectionError('Unable to retrieve governance items.');
    }
    const persona = personaFrom(request);
    if (scenario === 'empty') {
      return HttpResponse.json(EMPTY_PANEL(persona, 'govqueue', 'Endorsement queue'));
    }
    if (persona === 'GOVERNANCE') {
      return HttpResponse.json({ ...governanceQueue, persona });
    }
    return HttpResponse.json(EMPTY_PANEL(persona, 'govqueue', 'Endorsement queue'));
  }),
];
