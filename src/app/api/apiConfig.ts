import { getAppConfig } from '../config/appConfig';
import type { ApiMode, ApiResourceId } from './api.types';

/** Resolve mock|real for a resource: resource override → defaultMode → mock. */
export function getApiMode(resource?: ApiResourceId): ApiMode {
  const { api } = getAppConfig();
  if (resource) {
    const override = api.resources[resource]?.mode;
    if (override) return override;
  }
  return api.defaultMode ?? 'mock';
}

/**
 * Base URL for real mode. Mock mode always uses relative URLs (MSW).
 * Per-resource baseUrl overrides global api.baseUrl when set.
 */
export function getApiBaseUrl(resource?: ApiResourceId): string {
  if (getApiMode(resource) === 'mock') return '';
  const { api } = getAppConfig();
  if (resource) {
    const override = api.resources[resource]?.baseUrl;
    if (typeof override === 'string') return override.replace(/\/$/, '');
  }
  return api.baseUrl.replace(/\/$/, '');
}

/**
 * Start MSW when any resource would still be served as mock
 * (default mock, or an explicit resource mode of mock).
 */
export function shouldStartMsw(): boolean {
  const { api } = getAppConfig();
  if (api.defaultMode === 'mock') return true;
  return Object.values(api.resources).some((r) => r.mode === 'mock');
}
