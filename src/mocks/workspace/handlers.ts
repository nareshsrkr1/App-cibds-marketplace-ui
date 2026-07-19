import { delay, http, HttpResponse } from 'msw';
import context from '../session/context.json';
import producerConsole from './producer-console.json';

export type SessionMockScenario = 'success' | 'error' | 'noWorkspace' | 'delayed';
export type ConsoleMockScenario = 'success' | 'empty' | 'error' | 'delayed';

let sessionScenario: SessionMockScenario = 'success';
let consoleScenario: ConsoleMockScenario = 'success';
let delayMs = 200;

export function setSessionMockScenario(next: SessionMockScenario) {
  sessionScenario = next;
}

export function setConsoleMockScenario(next: ConsoleMockScenario) {
  consoleScenario = next;
}

export function setWorkspaceMockDelay(ms: number) {
  delayMs = ms;
}

export const SESSION_CONTEXT_URL = '/api/v1/session/context';
export const WORKSPACE_CONSOLE_URL = '/api/v1/workspace/console';

/** Greeting from session mock user — keep names out of handler strings. */
function afternoonGreeting(displayName: string): string {
  const first = displayName.trim().split(/\s+/)[0] || 'there';
  return `Good afternoon, ${first}.`;
}

function withSessionUser<T extends Record<string, unknown>>(payload: T) {
  const displayName = context.user.displayName;
  return {
    ...payload,
    displayName,
    greeting: afternoonGreeting(displayName),
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
  http.get(`*${WORKSPACE_CONSOLE_URL}`, async ({ request }) => {
    if (consoleScenario === 'delayed' || consoleScenario === 'success' || consoleScenario === 'empty') {
      await delay(consoleScenario === 'delayed' ? delayMs : 0);
    }
    if (consoleScenario === 'error') {
      return HttpResponse.json(
        {
          code: 'WORKSPACE_CONSOLE_UNAVAILABLE',
          message: 'Unable to retrieve console summary.',
        },
        { status: 500 },
      );
    }

    const url = new URL(request.url);
    const persona = (url.searchParams.get('persona') ?? 'PRODUCER').toUpperCase();

    if (consoleScenario === 'empty') {
      return HttpResponse.json(
        withSessionUser({
          persona,
          eyebrow: 'Producer Console',
          subtitle: 'Nothing to show yet.',
          kpis: [],
          actions: [],
          charts: [],
          panels: [],
        }),
      );
    }

    // Only Producer console is mocked for this delivery.
    if (persona !== 'PRODUCER') {
      return HttpResponse.json({
        persona,
        eyebrow: `${persona.charAt(0)}${persona.slice(1).toLowerCase()} Console`,
        greeting: 'Coming soon.',
        subtitle: 'This persona console is available in a future release.',
        displayName: context.user.displayName,
        kpis: [],
        actions: [],
        charts: [],
        panels: [],
      });
    }

    return HttpResponse.json(withSessionUser({ ...producerConsole, persona }));
  }),
];
