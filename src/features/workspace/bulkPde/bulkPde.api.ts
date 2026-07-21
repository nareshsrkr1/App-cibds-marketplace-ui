import { API_ENDPOINTS } from '../../../api';
import { httpGet, httpPost } from '../../../app/api/httpClient';
import type { ApiResult } from '../../../app/api/api.types';
import type {
  BulkPdeApplicationsResponse,
  BulkPdePreviewRequest,
  BulkPdePreviewResponse,
  BulkPdeRegisterRequest,
  BulkPdeRegisterResponse,
  BulkPdeTemplateResponse,
} from './bulkPde.types';

export const BULK_PDE_APPLICATIONS_PATH = API_ENDPOINTS.bulkPdeApplications.path;
export const BULK_PDE_TEMPLATE_PATH = API_ENDPOINTS.bulkPdeTemplate.path;
export const BULK_PDE_PREVIEW_PATH = API_ENDPOINTS.bulkPdePreview.path;
export const BULK_PDE_REGISTER_PATH = API_ENDPOINTS.bulkPdeRegister.path;

export async function fetchBulkPdeApplications(options?: {
  signal?: AbortSignal;
}): Promise<ApiResult<BulkPdeApplicationsResponse>> {
  return httpGet<BulkPdeApplicationsResponse>(BULK_PDE_APPLICATIONS_PATH, {
    signal: options?.signal,
    resource: API_ENDPOINTS.bulkPdeApplications.id,
  });
}

export async function fetchBulkPdeTemplate(options?: {
  signal?: AbortSignal;
}): Promise<ApiResult<BulkPdeTemplateResponse>> {
  return httpGet<BulkPdeTemplateResponse>(BULK_PDE_TEMPLATE_PATH, {
    signal: options?.signal,
    resource: API_ENDPOINTS.bulkPdeTemplate.id,
  });
}

export async function previewBulkPde(
  body: BulkPdePreviewRequest,
  options?: { signal?: AbortSignal },
): Promise<ApiResult<BulkPdePreviewResponse>> {
  return httpPost<BulkPdePreviewResponse>(BULK_PDE_PREVIEW_PATH, {
    body,
    signal: options?.signal,
    resource: API_ENDPOINTS.bulkPdePreview.id,
  });
}

export async function registerBulkPde(
  body: BulkPdeRegisterRequest,
  options?: { signal?: AbortSignal },
): Promise<ApiResult<BulkPdeRegisterResponse>> {
  return httpPost<BulkPdeRegisterResponse>(BULK_PDE_REGISTER_PATH, {
    body,
    signal: options?.signal,
    resource: API_ENDPOINTS.bulkPdeRegister.id,
  });
}
