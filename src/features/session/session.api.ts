import { httpGet } from '../../app/api/httpClient';
import type { ApiResult } from '../../app/api/api.types';
import type { SessionContext } from './session.types';

export const SESSION_CONTEXT_RESOURCE = 'sessionContext';
export const SESSION_CONTEXT_PATH = '/api/v1/session/context';

export async function fetchSessionContext(options?: {
  signal?: AbortSignal;
}): Promise<ApiResult<SessionContext>> {
  return httpGet<SessionContext>(SESSION_CONTEXT_PATH, {
    signal: options?.signal,
    resource: SESSION_CONTEXT_RESOURCE,
  });
}

export function hasEntitlement(
  context: SessionContext | null | undefined,
  entitlement: string,
): boolean {
  return Boolean(context?.entitlements?.includes(entitlement));
}
