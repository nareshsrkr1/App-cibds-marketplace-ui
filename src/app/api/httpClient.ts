import { getApiBaseUrl } from './apiConfig';
import type { ApiFeature, ApiResult } from './api.types';

type HttpGetOptions = {
  signal?: AbortSignal;
  feature?: ApiFeature;
};

function buildUrl(path: string, feature?: ApiFeature): string {
  const base = getApiBaseUrl(feature);
  if (!base) return path;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function httpGet<T>(
  path: string,
  options?: HttpGetOptions,
): Promise<ApiResult<T>> {
  const url = buildUrl(path, options?.feature);
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
