export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type FetchMode = 'success' | 'empty' | 'error';

let mode: FetchMode = 'success';

export function setMockFetchMode(next: FetchMode) {
  mode = next;
}

export function getMockFetchMode() {
  return mode;
}

export async function apiGet<T>(path: string, fixture: T, empty: T): Promise<ApiResult<T>> {
  await new Promise((r) => setTimeout(r, 280));
  if (mode === 'error') {
    return { ok: false, error: `Mock failure for ${path}` };
  }
  if (mode === 'empty') {
    return { ok: true, data: empty };
  }
  return { ok: true, data: fixture };
}
