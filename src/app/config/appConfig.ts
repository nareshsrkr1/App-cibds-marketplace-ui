import type {
  ApiMode,
  ApiResourceConfig,
  ApiRuntimeConfig,
  AppConfig,
} from '../api/api.types';

export type { AppConfig, ApiRuntimeConfig, ApiResourceConfig };

const DEFAULT_API: ApiRuntimeConfig = {
  defaultMode: 'mock',
  baseUrl: '',
  resources: {
    landingMetrics: { mode: 'mock' },
    landingContent: { mode: 'mock' },
    sessionContext: { mode: 'mock' },
    workspaceNav: { mode: 'mock' },
    workspaceConsoleHero: { mode: 'mock' },
    workspaceConsoleCharts: { mode: 'mock' },
    workspaceConsoleSubRequests: { mode: 'mock' },
    workspaceConsoleConsumers: { mode: 'mock' },
    workspaceConsoleGovernance: { mode: 'mock' },
    bulkPdeApplications: { mode: 'mock' },
    bulkPdeTemplate: { mode: 'mock' },
    bulkPdePreview: { mode: 'mock' },
    bulkPdeRegister: { mode: 'mock' },
    bindColumnsDatasets: { mode: 'mock' },
    bindColumnsHarvest: { mode: 'mock' },
    bindColumnsBdeOptions: { mode: 'mock' },
    bindColumnsPublish: { mode: 'mock' },
    workflowBoard: { mode: 'mock' },
    workflowApprove: { mode: 'mock' },
    workflowDecline: { mode: 'mock' },
    datasets: { mode: 'mock' },
  },
};

const DEFAULT_CONFIG: AppConfig = {
  api: {
    ...DEFAULT_API,
    resources: { ...DEFAULT_API.resources },
  },
};

let current: AppConfig = structuredClone(DEFAULT_CONFIG);

function asMode(value: unknown): ApiMode | undefined {
  return value === 'mock' || value === 'real' ? value : undefined;
}

function normalizeResources(raw: unknown): Record<string, ApiResourceConfig> {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<string, ApiResourceConfig> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== 'object') continue;
    const entry = value as Record<string, unknown>;
    const mode = asMode(entry.mode);
    const baseUrl =
      typeof entry.baseUrl === 'string' ? entry.baseUrl.replace(/\/$/, '') : undefined;
    out[key] = {
      ...(mode ? { mode } : {}),
      ...(baseUrl !== undefined ? { baseUrl } : {}),
    };
  }
  return out;
}

/** Accepts new nested shape or legacy flat { apiMode, apiBaseUrl }. */
export function normalizeAppConfig(input: unknown): AppConfig {
  const raw = (input ?? {}) as Record<string, unknown>;
  const nested = raw.api as Record<string, unknown> | undefined;

  if (nested && typeof nested === 'object') {
    return {
      api: {
        defaultMode: asMode(nested.defaultMode) ?? 'mock',
        baseUrl:
          typeof nested.baseUrl === 'string' ? nested.baseUrl.replace(/\/$/, '') : '',
        resources: normalizeResources(nested.resources),
      },
    };
  }

  // Legacy flat config from earlier SCRUM-8 shape
  return {
    api: {
      defaultMode: asMode(raw.apiMode) ?? 'mock',
      baseUrl:
        typeof raw.apiBaseUrl === 'string' ? raw.apiBaseUrl.replace(/\/$/, '') : '',
      resources: {},
    },
  };
}

export function getAppConfig(): AppConfig {
  return current;
}

export function setAppConfig(config: unknown): AppConfig {
  current = normalizeAppConfig(config);
  return current;
}

export function resetAppConfig(): AppConfig {
  current = structuredClone(DEFAULT_CONFIG);
  return current;
}
