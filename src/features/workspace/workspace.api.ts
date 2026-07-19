import { httpGet } from '../../app/api/httpClient';
import type { ApiResult } from '../../app/api/api.types';
import type { ConsoleSummary } from './workspace.types';

export const WORKSPACE_CONSOLE_RESOURCE = 'workspaceConsole';
export const WORKSPACE_CONSOLE_PATH = '/api/v1/workspace/console';

export async function fetchConsoleSummary(
  persona: string,
  options?: { signal?: AbortSignal },
): Promise<ApiResult<ConsoleSummary>> {
  const path = `${WORKSPACE_CONSOLE_PATH}?persona=${encodeURIComponent(persona)}`;
  return httpGet<ConsoleSummary>(path, {
    signal: options?.signal,
    resource: WORKSPACE_CONSOLE_RESOURCE,
  });
}
