export type ApiMode = 'mock' | 'real';

/** Stable API resource IDs used for phased mock/real rollout. */
export type ApiResourceId =
  | 'landingMetrics'
  | 'landingContent'
  | 'notifications'
  | 'datasets'
  | 'businessTerms'
  | 'governance'
  | 'search'
  | 'sessionContext'
  | 'workspaceNav'
  | 'workspaceConsoleHero'
  | 'workspaceConsoleCharts'
  | 'workspaceConsoleSubRequests'
  | 'workspaceConsoleConsumers'
  | 'workspaceConsoleGovernance'
  | (string & {});

export type ApiResourceConfig = {
  mode?: ApiMode;
  /** Optional per-resource base URL; falls back to api.baseUrl. */
  baseUrl?: string;
};

export type ApiRuntimeConfig = {
  defaultMode: ApiMode;
  baseUrl: string;
  resources: Record<string, ApiResourceConfig>;
};

export type AppConfig = {
  api: ApiRuntimeConfig;
};

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string; status?: number };
