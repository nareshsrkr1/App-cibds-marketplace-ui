import { API_ENDPOINTS } from '../../../api';
import { httpGet } from '../../../app/api/httpClient';
import type { ApiResult } from '../../../app/api/api.types';
import { adaptPhysicalDatasets } from './physicalDatasets.adapter';
import type { PhysicalDatasetsResponse } from './physicalDatasets.types';

export const DATASETS_PATH = API_ENDPOINTS.datasets.path;

export async function fetchPhysicalDatasets(options?: {
  signal?: AbortSignal;
}): Promise<ApiResult<PhysicalDatasetsResponse>> {
  const result = await httpGet<PhysicalDatasetsResponse>(DATASETS_PATH, {
    signal: options?.signal,
    resource: API_ENDPOINTS.datasets.id,
  });

  if (!result.ok) return result;
  return { ok: true, data: adaptPhysicalDatasets(result.data) };
}
