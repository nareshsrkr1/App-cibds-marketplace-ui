import { httpGet } from '../../app/api/httpClient';
import type { ApiResult } from '../../app/api/api.types';
import { adaptLandingMetrics } from './landing.adapter';
import type { LandingMetricsResponse } from './landing.types';

export const LANDING_METRICS_PATH = '/api/v1/marketplace/landing/metrics';

export async function fetchLandingMetrics(options?: {
  signal?: AbortSignal;
}): Promise<ApiResult<LandingMetricsResponse>> {
  const result = await httpGet<LandingMetricsResponse>(LANDING_METRICS_PATH, {
    signal: options?.signal,
    feature: 'landing',
  });

  if (!result.ok) return result;
  return { ok: true, data: adaptLandingMetrics(result.data) };
}
