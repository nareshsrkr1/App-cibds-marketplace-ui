import { getApiBaseUrl } from './apiConfig';
import type { ApiResourceId, ApiResult } from './api.types';

type HttpGetOptions = {
  signal?: AbortSignal;
  /** Stable API resource id for phased mock/real selection. */
  resource?: ApiResourceId;
};

/** Share one network request when the same URL is requested concurrently (e.g. React Strict Mode). */
const inflightGets = new Map<string, Promise<ApiResult<unknown>>>();

function buildUrl(path: string, resource?: ApiResourceId): string {
  const base = getApiBaseUrl(resource);
  if (!base) return path;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

async function executeGet<T>(url: string): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
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
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Network request failed',
    };
  }
}

function withCallerSignal<T>(
  shared: Promise<ApiResult<T>>,
  signal?: AbortSignal,
): Promise<ApiResult<T>> {
  if (!signal) return shared;
  if (signal.aborted) {
    return Promise.reject(new DOMException('Aborted', 'AbortError'));
  }

  return new Promise<ApiResult<T>>((resolve, reject) => {
    const onAbort = () => {
      cleanup();
      reject(new DOMException('Aborted', 'AbortError'));
    };
    const cleanup = () => signal.removeEventListener('abort', onAbort);
    signal.addEventListener('abort', onAbort);
    shared.then(
      (value) => {
        cleanup();
        resolve(value);
      },
      (error) => {
        cleanup();
        reject(error);
      },
    );
  });
}

export async function httpGet<T>(
  path: string,
  options?: HttpGetOptions,
): Promise<ApiResult<T>> {
  const url = buildUrl(path, options?.resource);

  let shared = inflightGets.get(url) as Promise<ApiResult<T>> | undefined;
  if (!shared) {
    shared = executeGet<T>(url);
    inflightGets.set(url, shared as Promise<ApiResult<unknown>>);
    void shared.finally(() => {
      if (inflightGets.get(url) === shared) {
        inflightGets.delete(url);
      }
    });
  }

  try {
    return await withCallerSignal(shared, options?.signal);
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
