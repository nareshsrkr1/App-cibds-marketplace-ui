import { API_ENDPOINTS } from '../../../api';
import { httpGet } from '../../../app/api/httpClient';
import type { ApiResult } from '../../../app/api/api.types';
import { adaptGlossaryTerms } from './glossary.adapter';
import type { GlossaryTermsResponse } from './glossary.types';

export const GLOSSARY_TERMS_PATH = API_ENDPOINTS.catalogueGlossaryTerms.path;

export async function fetchGlossaryTerms(options?: {
  signal?: AbortSignal;
}): Promise<ApiResult<GlossaryTermsResponse>> {
  const result = await httpGet<GlossaryTermsResponse>(GLOSSARY_TERMS_PATH, {
    signal: options?.signal,
    resource: API_ENDPOINTS.catalogueGlossaryTerms.id,
  });
  if (!result.ok) return result;
  return { ok: true, data: adaptGlossaryTerms(result.data) };
}
