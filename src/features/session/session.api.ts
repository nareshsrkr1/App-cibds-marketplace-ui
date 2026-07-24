import { API_ENDPOINTS } from '../../api';
import { httpGet } from '../../app/api/httpClient';
import type { ApiResult } from '../../app/api/api.types';
import { adaptSessionContext } from './session.adapter';
import type { SessionContext } from './session.types';

export const SESSION_CONTEXT_RESOURCE = API_ENDPOINTS.sessionContext.id;
export const SESSION_CONTEXT_PATH = API_ENDPOINTS.sessionContext.path;

export async function fetchSessionContext(options?: {
  signal?: AbortSignal;
}): Promise<ApiResult<SessionContext>> {
  const result = await httpGet<SessionContext>(SESSION_CONTEXT_PATH, {
    signal: options?.signal,
    resource: SESSION_CONTEXT_RESOURCE,
  });

  if (!result.ok) return result;
  return { ok: true, data: adaptSessionContext(result.data) };
}

export function hasEntitlement(
  context: SessionContext | null | undefined,
  entitlement: string,
): boolean {
  return Boolean(context?.entitlements?.includes(entitlement));
}
