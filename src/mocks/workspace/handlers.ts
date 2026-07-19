import { delay, http, HttpResponse } from 'msw';
import { API_ENDPOINTS } from '../../api';
import { personalizedGreeting } from '../../features/workspace/greeting';
import context from '../session/context.json';
import producerCharts from './producer-charts.json';
import producerGovernance from './producer-governance.json';
import producerHero from './producer-hero.json';
import producerSubRequests from './producer-subscription-requests.json';

export type SessionMockScenario = 'success' | 'error' | 'noWorkspace' | 'delayed';
export type ConsoleMockScenario = 'success' | 'empty' | 'error' | 'delayed';
export type ConsoleSectionId = 'hero' | 'charts' | 'subRequests' | 'governance';

const ALL_SECTIONS: ConsoleSectionId[] = ['hero', 'charts', 'subRequests', 'governance'];

let sessionScenario: SessionMockScenario = 'success';
let sectionScenarios: Record<ConsoleSectionId, ConsoleMockScenario> = {
  hero: 'success',
  charts: 'success',
  subRequests: 'success',
  governance: 'success',
};
let delayMs = 200;

export function setSessionMockScenario(next: SessionMockScenario) {
  sessionScenario = next;
}

/** Apply the same scenario to every console section (tests / reset). */
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

export function setWorkspaceMockDelay(ms: number) {
  delayMs = ms;
}

export const SESSION_CONTEXT_URL = API_ENDPOINTS.sessionContext.path;
export const WORKSPACE_CONSOLE_HERO_URL = API_ENDPOINTS.workspaceConsoleHero.path;
export const WORKSPACE_CONSOLE_CHARTS_URL = API_ENDPOINTS.workspaceConsoleCharts.path;
export const WORKSPACE_CONSOLE_SUB_REQUESTS_URL =
  API_ENDPOINTS.workspaceConsoleSubRequests.path;
export const WORKSPACE_CONSOLE_GOVERNANCE_URL =
  API_ENDPOINTS.workspaceConsoleGovernance.path;

function personaFrom(request: Request): string {
  return (new URL(request.url).searchParams.get('persona') ?? 'PRODUCER').toUpperCase();
}

async function applySectionScenario(section: ConsoleSectionId) {
  const scenario = sectionScenarios[section];
  if (scenario === 'delayed' || scenario === 'success' || scenario === 'empty') {
    await delay(scenario === 'delayed' ? delayMs : 0);
  }
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

export const workspaceHandlers = [
  http.get(`*${SESSION_CONTEXT_URL}`, async () => {
    if (sessionScenario === 'delayed' || sessionScenario === 'success' || sessionScenario === 'noWorkspace') {
      await delay(sessionScenario === 'delayed' ? delayMs : 0);
    }
    if (sessionScenario === 'error') {
      return HttpResponse.json(
        {
          code: 'SESSION_CONTEXT_UNAVAILABLE',
          message: 'Unable to retrieve session context.',
        },
        { status: 500 },
      );
    }
    if (sessionScenario === 'noWorkspace') {
      return HttpResponse.json({
        ...context,
        entitlements: [],
        enabledPersonas: [],
      });
    }
    return HttpResponse.json(context);
  }),

  http.get(`*${WORKSPACE_CONSOLE_HERO_URL}`, async ({ request }) => {
    const scenario = await applySectionScenario('hero');
    if (scenario === 'error') {
      return sectionError('Unable to retrieve console hero.');
    }
    const persona = personaFrom(request);
    if (scenario === 'empty' || persona !== 'PRODUCER') {
      return HttpResponse.json(
        withSessionUser({
          persona,
          eyebrow:
            persona === 'PRODUCER'
              ? 'Producer Console'
              : `${persona.charAt(0)}${persona.slice(1).toLowerCase()} Console`,
          subtitle:
            persona === 'PRODUCER'
              ? 'Nothing to show yet.'
              : 'This persona console is available in a future release.',
          kpis: [],
          actions: [],
        }),
      );
    }
    return HttpResponse.json(withSessionUser({ ...producerHero, persona }));
  }),

  http.get(`*${WORKSPACE_CONSOLE_CHARTS_URL}`, async ({ request }) => {
    const scenario = await applySectionScenario('charts');
    if (scenario === 'error') {
      return sectionError('Unable to retrieve console charts.');
    }
    const persona = personaFrom(request);
    if (scenario === 'empty' || persona !== 'PRODUCER') {
      return HttpResponse.json({ persona, charts: [] });
    }
    return HttpResponse.json({ ...producerCharts, persona });
  }),

  http.get(`*${WORKSPACE_CONSOLE_SUB_REQUESTS_URL}`, async ({ request }) => {
    const scenario = await applySectionScenario('subRequests');
    if (scenario === 'error') {
      return sectionError('Unable to retrieve subscription requests.');
    }
    const persona = personaFrom(request);
    if (scenario === 'empty' || persona !== 'PRODUCER') {
      return HttpResponse.json({
        persona,
        panel: {
          id: 'subreq',
          title: 'Subscription requests · awaiting your approval',
          moreLabel: 'All',
          items: [],
        },
      });
    }
    return HttpResponse.json({ ...producerSubRequests, persona });
  }),

  http.get(`*${WORKSPACE_CONSOLE_GOVERNANCE_URL}`, async ({ request }) => {
    const scenario = await applySectionScenario('governance');
    if (scenario === 'error') {
      return sectionError('Unable to retrieve governance items.');
    }
    const persona = personaFrom(request);
    if (scenario === 'empty' || persona !== 'PRODUCER') {
      return HttpResponse.json({
        persona,
        panel: {
          id: 'govsent',
          title: 'Sent to governance',
          moreLabel: 'All',
          items: [],
        },
      });
    }
    return HttpResponse.json({ ...producerGovernance, persona });
  }),
];
