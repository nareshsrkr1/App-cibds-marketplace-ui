import type { LandingMetric, LandingMetricKey, LandingMetricsResponse } from './landing.types';

const KEYS = new Set<LandingMetricKey>([
  'physical-datasets',
  'subject-areas',
  'logical-datasets',
  'data-elements',
  'business-terms',
]);

function isMetricKey(value: unknown): value is LandingMetricKey {
  return typeof value === 'string' && KEYS.has(value as LandingMetricKey);
}

export function adaptLandingMetrics(raw: LandingMetricsResponse): LandingMetricsResponse {
  const stats: LandingMetric[] = (raw.stats ?? [])
    .filter((item): item is LandingMetric =>
      !!item
      && isMetricKey(item.key)
      && typeof item.label === 'string'
      && (typeof item.value === 'number' || typeof item.value === 'string'),
    )
    .map((item) => ({
      key: item.key,
      label: item.label,
      value: Number(item.value),
    }));

  return { stats };
}
