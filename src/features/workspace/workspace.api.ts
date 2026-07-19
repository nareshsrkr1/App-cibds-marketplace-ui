import { httpGet } from '../../app/api/httpClient';
import type { ApiResult } from '../../app/api/api.types';
import type {
  ConsoleChartsResponse,
  ConsoleHero,
  ConsolePanelResponse,
} from './workspace.types';

export const WORKSPACE_CONSOLE_HERO_RESOURCE = 'workspaceConsoleHero';
export const WORKSPACE_CONSOLE_CHARTS_RESOURCE = 'workspaceConsoleCharts';
export const WORKSPACE_CONSOLE_SUB_REQUESTS_RESOURCE = 'workspaceConsoleSubRequests';
export const WORKSPACE_CONSOLE_GOVERNANCE_RESOURCE = 'workspaceConsoleGovernance';

export const WORKSPACE_CONSOLE_HERO_PATH = '/api/v1/workspace/console/hero';
export const WORKSPACE_CONSOLE_CHARTS_PATH = '/api/v1/workspace/console/charts';
export const WORKSPACE_CONSOLE_SUB_REQUESTS_PATH =
  '/api/v1/workspace/console/subscription-requests';
export const WORKSPACE_CONSOLE_GOVERNANCE_PATH = '/api/v1/workspace/console/governance';

function withPersona(path: string, persona: string): string {
  return `${path}?persona=${encodeURIComponent(persona)}`;
}

export async function fetchConsoleHero(
  persona: string,
  options?: { signal?: AbortSignal },
): Promise<ApiResult<ConsoleHero>> {
  return httpGet<ConsoleHero>(withPersona(WORKSPACE_CONSOLE_HERO_PATH, persona), {
    signal: options?.signal,
    resource: WORKSPACE_CONSOLE_HERO_RESOURCE,
  });
}

export async function fetchConsoleCharts(
  persona: string,
  options?: { signal?: AbortSignal },
): Promise<ApiResult<ConsoleChartsResponse>> {
  return httpGet<ConsoleChartsResponse>(
    withPersona(WORKSPACE_CONSOLE_CHARTS_PATH, persona),
    {
      signal: options?.signal,
      resource: WORKSPACE_CONSOLE_CHARTS_RESOURCE,
    },
  );
}

export async function fetchConsoleSubscriptionRequests(
  persona: string,
  options?: { signal?: AbortSignal },
): Promise<ApiResult<ConsolePanelResponse>> {
  return httpGet<ConsolePanelResponse>(
    withPersona(WORKSPACE_CONSOLE_SUB_REQUESTS_PATH, persona),
    {
      signal: options?.signal,
      resource: WORKSPACE_CONSOLE_SUB_REQUESTS_RESOURCE,
    },
  );
}

export async function fetchConsoleGovernance(
  persona: string,
  options?: { signal?: AbortSignal },
): Promise<ApiResult<ConsolePanelResponse>> {
  return httpGet<ConsolePanelResponse>(
    withPersona(WORKSPACE_CONSOLE_GOVERNANCE_PATH, persona),
    {
      signal: options?.signal,
      resource: WORKSPACE_CONSOLE_GOVERNANCE_RESOURCE,
    },
  );
}
