import { getApiBaseUrl } from './apiConfig';
import type { ApiResourceId, ApiResult } from './api.types';

type HttpGetOptions = {
  signal?: AbortSignal;
  /** Stable API resource id for phased mock/real selection. */
  resource?: ApiResourceId;
};

function buildUrl(path: string, resource?: ApiResourceId): string {
  const base = getApiBaseUrl(resource);
  if (!base) return path;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function httpGet<T>(
  path: string,
  options?: HttpGetOptions,
): Promise<ApiResult<T>> {
  const url = buildUrl(path, options?.resource);
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: options?.signal,
    });

    let body: unknown = null;
    const text = await response.text();
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = null;
      }
    }

    if (!response.ok) {
      const err = body as { message?: string; code?: string } | null;
      return {
        ok: false,
        error: err?.message ?? `Request failed (${response.status})`,
        code: err?.code,
        status: response.status,
      };
    }

    return { ok: true, data: body as T };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Network request failed',
    };
  }
}
