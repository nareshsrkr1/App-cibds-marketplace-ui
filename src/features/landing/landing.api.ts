import { API_ENDPOINTS } from '../../api';
import { httpGet } from '../../app/api/httpClient';
import type { ApiResult } from '../../app/api/api.types';
import { adaptLandingMetrics } from './landing.adapter';
import type { LandingContentResponse, LandingMetricsResponse } from './landing.types';

export const LANDING_METRICS_RESOURCE = API_ENDPOINTS.landingMetrics.id;
export const LANDING_METRICS_PATH = API_ENDPOINTS.landingMetrics.path;
export const LANDING_CONTENT_RESOURCE = API_ENDPOINTS.landingContent.id;
export const LANDING_CONTENT_PATH = API_ENDPOINTS.landingContent.path;

export async function fetchLandingMetrics(options?: {
  signal?: AbortSignal;
}): Promise<ApiResult<LandingMetricsResponse>> {
  const result = await httpGet<LandingMetricsResponse>(LANDING_METRICS_PATH, {
    signal: options?.signal,
    resource: LANDING_METRICS_RESOURCE,
  });

  if (!result.ok) return result;
  return { ok: true, data: adaptLandingMetrics(result.data) };
}

export async function fetchLandingContent(options?: {
  signal?: AbortSignal;
}): Promise<ApiResult<LandingContentResponse>> {
  return httpGet<LandingContentResponse>(LANDING_CONTENT_PATH, {
    signal: options?.signal,
    resource: LANDING_CONTENT_RESOURCE,
  });
}
