import { API_ENDPOINTS } from '../../../api';
import { httpGet } from '../../../app/api/httpClient';
import type { ApiResult } from '../../../app/api/api.types';
import { adaptBusinessElements, adaptLogicalModel } from './logicalModel.adapter';
import type { BusinessElementsResponse, LogicalModelResponse } from './logicalModel.types';

export const LOGICAL_MODEL_PATH = API_ENDPOINTS.catalogueLogicalModel.path;
export const BUSINESS_ELEMENTS_PATH = API_ENDPOINTS.catalogueBusinessElements.path;

export async function fetchLogicalModel(options?: {
  signal?: AbortSignal;
}): Promise<ApiResult<LogicalModelResponse>> {
  const result = await httpGet<LogicalModelResponse>(LOGICAL_MODEL_PATH, {
    signal: options?.signal,
    resource: API_ENDPOINTS.catalogueLogicalModel.id,
  });
  if (!result.ok) return result;
  return { ok: true, data: adaptLogicalModel(result.data) };
}

/**
 * Bulk BDE fetch, shared by Logical Model (inline rows + detail modal), Glossary Terms
 * (rollup lookups), and Lineage (node detail). `httpGet` already dedupes concurrent
 * in-flight requests, so calling this from multiple tabs on the same render is safe —
 * only the first caller triggers a network request per session.
 */
export async function fetchBusinessElements(options?: {
  signal?: AbortSignal;
}): Promise<ApiResult<BusinessElementsResponse>> {
  const result = await httpGet<BusinessElementsResponse>(BUSINESS_ELEMENTS_PATH, {
    signal: options?.signal,
    resource: API_ENDPOINTS.catalogueBusinessElements.id,
  });
  if (!result.ok) return result;
  return { ok: true, data: adaptBusinessElements(result.data) };
}
