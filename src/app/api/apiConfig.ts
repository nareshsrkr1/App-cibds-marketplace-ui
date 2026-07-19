import type { ApiFeature, ApiMode } from './api.types';

function readMode(raw: unknown): ApiMode | undefined {
  if (raw === 'mock' || raw === 'real') return raw;
  return undefined;
}

/** Global API mode. Defaults to mock when unset. */
export function getApiMode(feature?: ApiFeature): ApiMode {
  if (feature === 'landing') {
    const override = readMode(import.meta.env.VITE_LANDING_API_MODE);
    if (override) return override;
  }
  return readMode(import.meta.env.VITE_API_MODE) ?? 'mock';
}

/** Blank/relative in mock mode; VITE_API_BASE_URL in real mode. */
export function getApiBaseUrl(feature?: ApiFeature): string {
  if (getApiMode(feature) === 'mock') return '';
  const base = import.meta.env.VITE_API_BASE_URL;
  return typeof base === 'string' ? base.replace(/\/$/, '') : '';
}

export function shouldStartMsw(feature: ApiFeature = 'landing'): boolean {
  return getApiMode(feature) === 'mock';
}
