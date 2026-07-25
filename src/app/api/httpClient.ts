import { getApiBaseUrl, getApiMode } from './apiConfig';
import { getAuthToken } from './authToken';
import type { ApiResourceId, ApiResult } from './api.types';

type HttpGetOptions = {
  signal?: AbortSignal;
  /** Stable API resource id for phased mock/real selection. */
  resource?: ApiResourceId;
};

type HttpMutateOptions = HttpGetOptions & {
  body?: unknown;
};

/** Network requests are aborted after this long if the caller hasn't already cancelled. */
const DEFAULT_TIMEOUT_MS = 20_000;

/** Share one network request when the same URL is requested concurrently (e.g. React Strict Mode). */
const inflightGets = new Map<string, Promise<ApiResult<unknown>>>();

function buildUrl(path: string, resource?: ApiResourceId): string {
  const base = getApiBaseUrl(resource);
  if (!base) return path;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

async function buildHeaders(hasBody: boolean): Promise<HeadersInit> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (hasBody) headers['Content-Type'] = 'application/json';

  const token = await getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  return headers;
}

/**
 * Fetch with a hard timeout, independent of any caller-supplied AbortSignal.
 * Races the timeout against the request instead of passing an AbortSignal
 * into `fetch()` itself — MSW/undici reject AbortSignal instances created in
 * a different realm (e.g. jsdom in tests), so this stays realm-agnostic.
 */
async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new DOMException('Request timed out', 'TimeoutError')),
      DEFAULT_TIMEOUT_MS,
    );
  });
  try {
    return await Promise.race([fetch(url, init), timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function execute<T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: unknown,
): Promise<ApiResult<T>> {
  try {
    const hasBody = body !== undefined;
    const response = await fetchWithTimeout(url, {
      method,
      credentials: 'same-origin',
      headers: await buildHeaders(hasBody),
      body: hasBody ? JSON.stringify(body) : undefined,
    });

    let responseBody: unknown = null;
    const text = await response.text();
    if (text) {
      try {
        responseBody = JSON.parse(text);
      } catch {
        responseBody = null;
      }
    }

    if (!response.ok) {
      const err = responseBody as { message?: string; code?: string } | null;
      return {
        ok: false,
        error: err?.message ?? `Request failed (${response.status})`,
        code: err?.code,
        status: response.status,
      };
    }

    return { ok: true, data: responseBody as T };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      return { ok: false, error: 'Request timed out', code: 'TIMEOUT' };
    }
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

/**
 * A GET that 404s while the resource is in mock mode and the page has no
 * active Service Worker controller almost certainly bypassed MSW rather than
 * being a real "not found" — the mock worker went idle (browsers terminate
 * idle Service Workers) and hadn't re-activated yet. Re-register it and
 * retry this GET once before surfacing an error. GET-only and mock-only by
 * design: never applied to mutations or real-backend calls.
 */
async function recoverFromStaleMockWorker<T>(
  result: ApiResult<T>,
  url: string,
  resource?: ApiResourceId,
): Promise<ApiResult<T>> {
  if (result.ok || result.status !== 404) return result;
  if (getApiMode(resource) !== 'mock') return result;
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return result;
  if (navigator.serviceWorker.controller) return result;

  const { ensureMockWorkerActive } = await import('../../api/mock/browser');
  await ensureMockWorkerActive().catch(() => {});
  return execute<T>(url, 'GET');
}

export async function httpGet<T>(
  path: string,
  options?: HttpGetOptions,
): Promise<ApiResult<T>> {
  const url = buildUrl(path, options?.resource);

  let shared = inflightGets.get(url) as Promise<ApiResult<T>> | undefined;
  if (!shared) {
    shared = execute<T>(url, 'GET').then((result) =>
      recoverFromStaleMockWorker(result, url, options?.resource),
    );
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

/** Mutating requests are not deduped or shared across callers — each call is independent. */
async function httpMutate<T>(
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  options?: HttpMutateOptions,
): Promise<ApiResult<T>> {
  const url = buildUrl(path, options?.resource);
  const result = execute<T>(url, method, options?.body);

  try {
    return await withCallerSignal(result, options?.signal);
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

export function httpPost<T>(
  path: string,
  options?: HttpMutateOptions,
): Promise<ApiResult<T>> {
  return httpMutate<T>('POST', path, options);
}

export function httpPut<T>(
  path: string,
  options?: HttpMutateOptions,
): Promise<ApiResult<T>> {
  return httpMutate<T>('PUT', path, options);
}

export function httpPatch<T>(
  path: string,
  options?: HttpMutateOptions,
): Promise<ApiResult<T>> {
  return httpMutate<T>('PATCH', path, options);
}

export function httpDelete<T>(
  path: string,
  options?: HttpMutateOptions,
): Promise<ApiResult<T>> {
  return httpMutate<T>('DELETE', path, options);
}
