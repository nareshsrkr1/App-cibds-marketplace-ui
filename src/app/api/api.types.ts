export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string; status?: number };

export type ApiMode = 'mock' | 'real';

export type ApiFeature = 'landing';
