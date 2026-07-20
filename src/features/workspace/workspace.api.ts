import { API_ENDPOINTS, withPersonaQuery } from '../../api';
import { httpGet } from '../../app/api/httpClient';
import type { ApiResult } from '../../app/api/api.types';
import type { WorkspaceNavResponse } from './nav.types';
import type {
  ConsoleChartsResponse,
  ConsoleHero,
  ConsolePanelResponse,
} from './workspace.types';

export const WORKSPACE_NAV_RESOURCE = API_ENDPOINTS.workspaceNav.id;
export const WORKSPACE_CONSOLE_HERO_RESOURCE = API_ENDPOINTS.workspaceConsoleHero.id;
export const WORKSPACE_CONSOLE_CHARTS_RESOURCE = API_ENDPOINTS.workspaceConsoleCharts.id;
export const WORKSPACE_CONSOLE_SUB_REQUESTS_RESOURCE =
  API_ENDPOINTS.workspaceConsoleSubRequests.id;
export const WORKSPACE_CONSOLE_CONSUMERS_RESOURCE =
  API_ENDPOINTS.workspaceConsoleConsumers.id;
export const WORKSPACE_CONSOLE_GOVERNANCE_RESOURCE =
  API_ENDPOINTS.workspaceConsoleGovernance.id;

export const WORKSPACE_NAV_PATH = API_ENDPOINTS.workspaceNav.path;
export const WORKSPACE_CONSOLE_HERO_PATH = API_ENDPOINTS.workspaceConsoleHero.path;
export const WORKSPACE_CONSOLE_CHARTS_PATH = API_ENDPOINTS.workspaceConsoleCharts.path;
export const WORKSPACE_CONSOLE_SUB_REQUESTS_PATH =
  API_ENDPOINTS.workspaceConsoleSubRequests.path;
export const WORKSPACE_CONSOLE_CONSUMERS_PATH =
  API_ENDPOINTS.workspaceConsoleConsumers.path;
export const WORKSPACE_CONSOLE_GOVERNANCE_PATH =
  API_ENDPOINTS.workspaceConsoleGovernance.path;

export async function fetchWorkspaceNav(
  persona: string,
  options?: { signal?: AbortSignal },
): Promise<ApiResult<WorkspaceNavResponse>> {
  return httpGet<WorkspaceNavResponse>(withPersonaQuery(WORKSPACE_NAV_PATH, persona), {
    signal: options?.signal,
    resource: WORKSPACE_NAV_RESOURCE,
  });
}

export async function fetchConsoleHero(
  persona: string,
  options?: { signal?: AbortSignal },
): Promise<ApiResult<ConsoleHero>> {
  return httpGet<ConsoleHero>(withPersonaQuery(WORKSPACE_CONSOLE_HERO_PATH, persona), {
    signal: options?.signal,
    resource: WORKSPACE_CONSOLE_HERO_RESOURCE,
  });
}

export async function fetchConsoleCharts(
  persona: string,
  options?: { signal?: AbortSignal },
): Promise<ApiResult<ConsoleChartsResponse>> {
  return httpGet<ConsoleChartsResponse>(
    withPersonaQuery(WORKSPACE_CONSOLE_CHARTS_PATH, persona),
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
    withPersonaQuery(WORKSPACE_CONSOLE_SUB_REQUESTS_PATH, persona),
    {
      signal: options?.signal,
      resource: WORKSPACE_CONSOLE_SUB_REQUESTS_RESOURCE,
    },
  );
}

export async function fetchConsoleConsumers(
  persona: string,
  options?: { signal?: AbortSignal },
): Promise<ApiResult<ConsolePanelResponse>> {
  return httpGet<ConsolePanelResponse>(
    withPersonaQuery(WORKSPACE_CONSOLE_CONSUMERS_PATH, persona),
    {
      signal: options?.signal,
      resource: WORKSPACE_CONSOLE_CONSUMERS_RESOURCE,
    },
  );
}

export async function fetchConsoleGovernance(
  persona: string,
  options?: { signal?: AbortSignal },
): Promise<ApiResult<ConsolePanelResponse>> {
  return httpGet<ConsolePanelResponse>(
    withPersonaQuery(WORKSPACE_CONSOLE_GOVERNANCE_PATH, persona),
    {
      signal: options?.signal,
      resource: WORKSPACE_CONSOLE_GOVERNANCE_RESOURCE,
    },
  );
}
