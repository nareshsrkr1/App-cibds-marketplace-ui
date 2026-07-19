import { apiGet, type ApiResult } from '../../app/apiClient';
import type { LandingProofStats } from './landing.types';

const FIXTURE: LandingProofStats = {
  stats: [
    { value: '6', label: 'Physical datasets' },
    { value: '14', label: 'Subject areas' },
    { value: '27', label: 'Logical datasets' },
    { value: '74', label: 'Data elements' },
    { value: '68', label: 'Business terms' },
  ],
};

const EMPTY: LandingProofStats = { stats: [] };

export async function fetchLandingProofStats(): Promise<ApiResult<LandingProofStats>> {
  return apiGet('/mock/landing/proof-stats', FIXTURE, EMPTY);
}
