import { API_ENDPOINTS } from '../../../api';
import { httpGet, httpPost } from '../../../app/api/httpClient';
import type { ApiResult } from '../../../app/api/api.types';
import type {
  BindBdeOptionsResponse,
  BindDatasetsResponse,
  BindHarvestResponse,
  BindPublishRequest,
  BindPublishResponse,
} from './bindColumns.types';

export const BIND_DATASETS_PATH = API_ENDPOINTS.bindColumnsDatasets.path;
export const BIND_HARVEST_PATH = API_ENDPOINTS.bindColumnsHarvest.path;
export const BIND_BDE_OPTIONS_PATH = API_ENDPOINTS.bindColumnsBdeOptions.path;
export const BIND_PUBLISH_PATH = API_ENDPOINTS.bindColumnsPublish.path;

export async function fetchBindDatasets(options?: {
  signal?: AbortSignal;
}): Promise<ApiResult<BindDatasetsResponse>> {
  return httpGet<BindDatasetsResponse>(BIND_DATASETS_PATH, {
    signal: options?.signal,
    resource: API_ENDPOINTS.bindColumnsDatasets.id,
  });
}

export async function harvestBindColumns(
  body: { datasetId: string },
  options?: { signal?: AbortSignal },
): Promise<ApiResult<BindHarvestResponse>> {
  return httpPost<BindHarvestResponse>(BIND_HARVEST_PATH, {
    body,
    signal: options?.signal,
    resource: API_ENDPOINTS.bindColumnsHarvest.id,
  });
}

export async function fetchBindBdeOptions(options?: {
  signal?: AbortSignal;
}): Promise<ApiResult<BindBdeOptionsResponse>> {
  return httpGet<BindBdeOptionsResponse>(BIND_BDE_OPTIONS_PATH, {
    signal: options?.signal,
    resource: API_ENDPOINTS.bindColumnsBdeOptions.id,
  });
}

export async function publishBindColumns(
  body: BindPublishRequest,
  options?: { signal?: AbortSignal },
): Promise<ApiResult<BindPublishResponse>> {
  return httpPost<BindPublishResponse>(BIND_PUBLISH_PATH, {
    body,
    signal: options?.signal,
    resource: API_ENDPOINTS.bindColumnsPublish.id,
  });
}
