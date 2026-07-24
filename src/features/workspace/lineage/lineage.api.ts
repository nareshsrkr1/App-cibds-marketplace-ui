import { API_ENDPOINTS } from '../../../api';
import { httpGet } from '../../../app/api/httpClient';
import type { ApiResult } from '../../../app/api/api.types';
import { adaptLineageDetails, adaptLineageSummaries } from './lineage.adapter';
import type { LineageDetailsResponse, LineageSummaryResponse } from './lineage.types';

export const LINEAGE_PATH = API_ENDPOINTS.catalogueLineage.path;
export const LINEAGE_DETAILS_PATH = API_ENDPOINTS.catalogueLineageDetails.path;

export async function fetchLineageSummaries(options?: {
  signal?: AbortSignal;
}): Promise<ApiResult<LineageSummaryResponse>> {
  const result = await httpGet<LineageSummaryResponse>(LINEAGE_PATH, {
    signal: options?.signal,
    resource: API_ENDPOINTS.catalogueLineage.id,
  });
  if (!result.ok) return result;
  return { ok: true, data: adaptLineageSummaries(result.data) };
}

/** Fetched lazily — only once a diagram node is actually clicked. */
export async function fetchLineageDetails(options?: {
  signal?: AbortSignal;
}): Promise<ApiResult<LineageDetailsResponse>> {
  const result = await httpGet<LineageDetailsResponse>(LINEAGE_DETAILS_PATH, {
    signal: options?.signal,
    resource: API_ENDPOINTS.catalogueLineageDetails.id,
  });
  if (!result.ok) return result;
  return { ok: true, data: adaptLineageDetails(result.data) };
}
