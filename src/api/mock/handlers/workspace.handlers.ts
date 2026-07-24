/**
 * Mock latency controlled by src/api/mock/mockDelay.ts (default 0).
 */
import { delay, http, HttpResponse } from 'msw';
import { API_ENDPOINTS } from '../../endpoints';
import { personalizedGreeting } from '../../../features/workspace/greeting';
import type { WorkspaceNavResponse } from '../../../features/workspace/nav.types';
import type {
  ConsoleChartsResponse,
  ConsoleHero,
} from '../../../features/workspace/workspace.types';
import { getMockResponseDelay, setMockResponseDelay } from '../mockDelay';
import context from '../../../mocks/session/context.json';
import adminCharts from '../../../mocks/workspace/admin/charts.json';
import adminHero from '../../../mocks/workspace/admin/hero.json';
import adminNav from '../../../mocks/workspace/admin/nav.json';
import consumerCharts from '../../../mocks/workspace/consumer/charts.json';
import consumerHero from '../../../mocks/workspace/consumer/hero.json';
import consumerNav from '../../../mocks/workspace/consumer/nav.json';
import governanceCharts from '../../../mocks/workspace/governance/charts.json';
import governanceHero from '../../../mocks/workspace/governance/hero.json';
import governanceNav from '../../../mocks/workspace/governance/nav.json';
import governanceQueue from '../../../mocks/workspace/governance/queue.json';
import producerCharts from '../../../mocks/workspace/producer/charts.json';
import producerConsumers from '../../../mocks/workspace/producer/consumers.json';
import producerHero from '../../../mocks/workspace/producer/hero.json';
import producerNav from '../../../mocks/workspace/producer/nav.json';
import producerSubRequests from '../../../mocks/workspace/producer/subscription-requests.json';
import bulkPdeApplications from '../../../mocks/workspace/producer/bulk-pde/applications.json';
import bulkPdePreview from '../../../mocks/workspace/producer/bulk-pde/preview.json';
import bulkPdeTemplate from '../../../mocks/workspace/producer/bulk-pde/template.json';
import bindColumnsDatasets from '../../../mocks/workspace/producer/bind-columns/datasets.json';
import bindColumnsHarvest from '../../../mocks/workspace/producer/bind-columns/harvest.json';
import bindColumnsBdeOptions from '../../../mocks/workspace/producer/bind-columns/bde-options.json';
import workflowBoardSeed from '../../../mocks/workspace/producer/workflow/board.json';
import physicalDatasets from '../../../mocks/workspace/catalogue/physical-datasets.json';

export type SessionMockScenario = 'success' | 'error' | 'noWorkspace' | 'delayed';
export type ConsoleMockScenario = 'success' | 'empty' | 'error' | 'delayed';
export type ConsoleSectionId =
  'nav' | 'hero' | 'charts' | 'subRequests' | 'consumers' | 'governance';

const ALL_SECTIONS: ConsoleSectionId[] = [
  'nav',
  'hero',
  'charts',
  'subRequests',
  'consumers',
  'governance',
];

let sessionScenario: SessionMockScenario = 'success';
const sectionScenarios: Record<ConsoleSectionId, ConsoleMockScenario> = {
  nav: 'success',
  hero: 'success',
  charts: 'success',
  subRequests: 'success',
  consumers: 'success',
  governance: 'success',
};

/** @deprecated Prefer setMockResponseDelay from mockDelay.ts */
export function setWorkspaceMockDelay(ms: number) {
  setMockResponseDelay(ms);
}

export function setSessionMockScenario(next: SessionMockScenario) {
  sessionScenario = next;
}

export function setConsoleMockScenario(next: ConsoleMockScenario) {
  for (const id of ALL_SECTIONS) {
    sectionScenarios[id] = next;
  }
}

export function setConsoleSectionScenario(
  section: ConsoleSectionId,
  next: ConsoleMockScenario,
) {
  sectionScenarios[section] = next;
}

export const SESSION_CONTEXT_URL = API_ENDPOINTS.sessionContext.path;
export const WORKSPACE_NAV_URL = API_ENDPOINTS.workspaceNav.path;
export const WORKSPACE_CONSOLE_HERO_URL = API_ENDPOINTS.workspaceConsoleHero.path;
export const WORKSPACE_CONSOLE_CHARTS_URL = API_ENDPOINTS.workspaceConsoleCharts.path;
export const WORKSPACE_CONSOLE_SUB_REQUESTS_URL =
  API_ENDPOINTS.workspaceConsoleSubRequests.path;
export const WORKSPACE_CONSOLE_CONSUMERS_URL =
  API_ENDPOINTS.workspaceConsoleConsumers.path;
export const WORKSPACE_CONSOLE_GOVERNANCE_URL =
  API_ENDPOINTS.workspaceConsoleGovernance.path;
export const BULK_PDE_APPLICATIONS_URL = API_ENDPOINTS.bulkPdeApplications.path;
export const BULK_PDE_TEMPLATE_URL = API_ENDPOINTS.bulkPdeTemplate.path;
export const BULK_PDE_PREVIEW_URL = API_ENDPOINTS.bulkPdePreview.path;
export const BULK_PDE_REGISTER_URL = API_ENDPOINTS.bulkPdeRegister.path;
export const BIND_COLUMNS_DATASETS_URL = API_ENDPOINTS.bindColumnsDatasets.path;
export const BIND_COLUMNS_HARVEST_URL = API_ENDPOINTS.bindColumnsHarvest.path;
export const BIND_COLUMNS_BDE_OPTIONS_URL = API_ENDPOINTS.bindColumnsBdeOptions.path;
export const BIND_COLUMNS_PUBLISH_URL = API_ENDPOINTS.bindColumnsPublish.path;
export const WORKFLOW_BOARD_URL = API_ENDPOINTS.workflowBoard.path;
export const WORKFLOW_APPROVE_URL = API_ENDPOINTS.workflowApprove.path;
export const WORKFLOW_DECLINE_URL = API_ENDPOINTS.workflowDecline.path;
export const DATASETS_URL = API_ENDPOINTS.datasets.path;

function personaFrom(request: Request): string {
  return (new URL(request.url).searchParams.get('persona') ?? 'PRODUCER').toUpperCase();
}

async function applyLatency() {
  const ms = getMockResponseDelay();
  if (ms > 0) await delay(ms);
}

async function applySectionScenario(section: ConsoleSectionId) {
  const scenario = sectionScenarios[section];
  if (scenario === 'error') return scenario;
  await applyLatency();
  return scenario;
}

function sectionError(message: string) {
  return HttpResponse.json(
    {
      code: 'WORKSPACE_CONSOLE_SECTION_UNAVAILABLE',
      message,
    },
    { status: 500 },
  );
}

function withSessionUser<T extends Record<string, unknown>>(payload: T) {
  const displayName = context.user.displayName;
  return {
    ...payload,
    displayName,
    greeting: personalizedGreeting(displayName),
  };
}

// JSON imports are widened to their domain response type — each persona's mock file
// shapes its own union members (e.g. chart `kind`), which literal `typeof` inference
// on a single import can't express for the other three.
const NAV_BY_PERSONA: Record<string, WorkspaceNavResponse> = {
  PRODUCER: producerNav as WorkspaceNavResponse,
  GOVERNANCE: governanceNav as WorkspaceNavResponse,
  CONSUMER: consumerNav as WorkspaceNavResponse,
  ADMIN: adminNav as WorkspaceNavResponse,
};

const HERO_BY_PERSONA: Record<string, ConsoleHero> = {
  PRODUCER: producerHero as ConsoleHero,
  GOVERNANCE: governanceHero as ConsoleHero,
  CONSUMER: consumerHero as ConsoleHero,
  ADMIN: adminHero as ConsoleHero,
};

const CHARTS_BY_PERSONA: Record<string, ConsoleChartsResponse> = {
  PRODUCER: producerCharts as ConsoleChartsResponse,
  GOVERNANCE: governanceCharts as ConsoleChartsResponse,
  CONSUMER: consumerCharts as ConsoleChartsResponse,
  ADMIN: adminCharts as ConsoleChartsResponse,
};

const EMPTY_PANEL = (persona: string, id: string, title: string) => ({
  persona,
  panel: { id, title, moreLabel: 'All', items: [] as unknown[] },
});

export const workspaceHandlers = [
  http.get(`*${SESSION_CONTEXT_URL}`, async () => {
    if (sessionScenario === 'error') {
      return HttpResponse.json(
        {
          code: 'SESSION_CONTEXT_UNAVAILABLE',
          message: 'Unable to retrieve session context.',
        },
        { status: 500 },
      );
    }
    await applyLatency();
    if (sessionScenario === 'noWorkspace') {
      return HttpResponse.json({
        ...context,
        entitlements: [],
        enabledPersonas: [],
      });
    }
    return HttpResponse.json(context);
  }),

  http.get(`*${WORKSPACE_NAV_URL}`, async ({ request }) => {
    const scenario = await applySectionScenario('nav');
    if (scenario === 'error') {
      return sectionError('Unable to retrieve workspace navigation.');
    }
    const persona = personaFrom(request);
    if (scenario === 'empty') {
      return HttpResponse.json({ persona, groups: [] });
    }
    const nav = NAV_BY_PERSONA[persona] ?? NAV_BY_PERSONA.PRODUCER;
    return HttpResponse.json({ ...nav, persona });
  }),

  http.get(`*${WORKSPACE_CONSOLE_HERO_URL}`, async ({ request }) => {
    const scenario = await applySectionScenario('hero');
    if (scenario === 'error') {
      return sectionError('Unable to retrieve console hero.');
    }
    const persona = personaFrom(request);
    const hero = HERO_BY_PERSONA[persona] ?? HERO_BY_PERSONA.PRODUCER;
    if (scenario === 'empty') {
      return HttpResponse.json(
        withSessionUser({
          persona,
          eyebrow: hero.eyebrow,
          subtitle: 'Nothing to show yet.',
          kpis: [],
          actions: [],
        }),
      );
    }
    return HttpResponse.json(withSessionUser({ ...hero, persona }));
  }),

  http.get(`*${WORKSPACE_CONSOLE_CHARTS_URL}`, async ({ request }) => {
    const scenario = await applySectionScenario('charts');
    if (scenario === 'error') {
      return sectionError('Unable to retrieve console charts.');
    }
    const persona = personaFrom(request);
    if (scenario === 'empty') {
      return HttpResponse.json({ persona, tiers: [], charts: [] });
    }
    const charts = CHARTS_BY_PERSONA[persona] ?? { persona, tiers: [], charts: [] };
    return HttpResponse.json({ ...charts, persona });
  }),

  http.get(`*${WORKSPACE_CONSOLE_SUB_REQUESTS_URL}`, async ({ request }) => {
    const scenario = await applySectionScenario('subRequests');
    if (scenario === 'error') {
      return sectionError('Unable to retrieve subscription requests.');
    }
    const persona = personaFrom(request);
    if (scenario === 'empty' || persona !== 'PRODUCER') {
      return HttpResponse.json(
        EMPTY_PANEL(persona, 'subreq', 'Subscription requests · awaiting your approval'),
      );
    }
    return HttpResponse.json({ ...producerSubRequests, persona });
  }),

  http.get(`*${WORKSPACE_CONSOLE_CONSUMERS_URL}`, async ({ request }) => {
    const scenario = await applySectionScenario('consumers');
    if (scenario === 'error') {
      return sectionError('Unable to retrieve consumers.');
    }
    const persona = personaFrom(request);
    if (scenario === 'empty' || persona !== 'PRODUCER') {
      return HttpResponse.json(
        EMPTY_PANEL(persona, 'consumers', 'My consumers · last delivery & SLA'),
      );
    }
    return HttpResponse.json({ ...producerConsumers, persona });
  }),

  http.get(`*${WORKSPACE_CONSOLE_GOVERNANCE_URL}`, async ({ request }) => {
    const scenario = await applySectionScenario('governance');
    if (scenario === 'error') {
      return sectionError('Unable to retrieve governance items.');
    }
    const persona = personaFrom(request);
    if (scenario === 'empty') {
      return HttpResponse.json(EMPTY_PANEL(persona, 'govqueue', 'Endorsement queue'));
    }
    if (persona === 'GOVERNANCE') {
      return HttpResponse.json({ ...governanceQueue, persona });
    }
    return HttpResponse.json(EMPTY_PANEL(persona, 'govqueue', 'Endorsement queue'));
  }),

  http.get(`*${BULK_PDE_APPLICATIONS_URL}`, async () => {
    await applyLatency();
    return HttpResponse.json(bulkPdeApplications);
  }),

  http.get(`*${BULK_PDE_TEMPLATE_URL}`, async () => {
    await applyLatency();
    return HttpResponse.json(bulkPdeTemplate);
  }),

  // Preview mock kept for future server-side CSV parse; UI sample uses client data.
  http.post(`*${BULK_PDE_PREVIEW_URL}`, async ({ request }) => {
    await applyLatency();
    const body = (await request.json().catch(() => null)) as {
      applicationId?: string;
    } | null;
    if (!body?.applicationId) {
      return HttpResponse.json(
        {
          code: 'BULK_PDE_APP_REQUIRED',
          message: 'Select an application before loading a PDE file.',
        },
        { status: 400 },
      );
    }
    return HttpResponse.json({
      rows: bulkPdePreview.rows.map((r) => ({ ...r })),
    });
  }),

  http.post(`*${BULK_PDE_REGISTER_URL}`, async ({ request }) => {
    await applyLatency();
    const body = (await request.json().catch(() => null)) as {
      applicationId?: string;
      offerId?: string;
      rows?: Array<{ dataset?: string }>;
    } | null;
    if (!body?.applicationId || !body.offerId || !Array.isArray(body.rows)) {
      return HttpResponse.json(
        {
          code: 'BULK_PDE_REGISTER_INVALID',
          message: 'Unable to register PDEs — missing application or rows.',
        },
        { status: 400 },
      );
    }
    const dsNames = [...new Set(body.rows.map((r) => r.dataset).filter(Boolean))] as string[];
    const datasets = dsNames.map((name, i) => ({
      name,
      dsId: `DS-CIB-${40400 + i * 17 + Math.floor(Math.random() * 40)}`,
    }));
    return HttpResponse.json({
      count: body.rows.length,
      offerId: body.offerId,
      datasets,
    });
  }),

  http.get(`*${BIND_COLUMNS_DATASETS_URL}`, async () => {
    await applyLatency();
    return HttpResponse.json(bindColumnsDatasets);
  }),

  http.get(`*${BIND_COLUMNS_BDE_OPTIONS_URL}`, async () => {
    await applyLatency();
    return HttpResponse.json(bindColumnsBdeOptions);
  }),

  http.post(`*${BIND_COLUMNS_HARVEST_URL}`, async ({ request }) => {
    await applyLatency();
    const body = (await request.json().catch(() => null)) as {
      datasetId?: string;
    } | null;
    if (!body?.datasetId) {
      return HttpResponse.json(
        {
          code: 'BIND_DATASET_REQUIRED',
          message: 'Select a dataset before harvesting columns.',
        },
        { status: 400 },
      );
    }
    return HttpResponse.json({
      columns: bindColumnsHarvest.columns.map((c) => ({ ...c })),
    });
  }),

  http.post(`*${BIND_COLUMNS_PUBLISH_URL}`, async ({ request }) => {
    await applyLatency();
    const body = (await request.json().catch(() => null)) as {
      datasetId?: string;
      offerId?: string;
      contractName?: string;
      reviewPath?: string;
      columns?: Array<{ boundTo?: string }>;
    } | null;
    if (!body?.datasetId || !body.offerId || !body.contractName?.trim()) {
      return HttpResponse.json(
        {
          code: 'BIND_PUBLISH_INVALID',
          message: 'Unable to publish — missing dataset or contract name.',
        },
        { status: 400 },
      );
    }
    const cols = body.columns ?? [];
    const boundCount = cols.filter((c) => Boolean(c.boundTo?.trim())).length;
    let datasetName = body.datasetId;
    for (const app of bindColumnsDatasets.applications) {
      const hit = app.datasets.find((d) => d.dsId === body.datasetId);
      if (hit) {
        datasetName = hit.name;
        break;
      }
    }
    return HttpResponse.json({
      datasetId: body.datasetId,
      datasetName,
      offerId: body.offerId,
      boundCount,
      totalColumns: cols.length,
      reviewPath: body.reviewPath === 'self' ? 'self' : 'steward',
      contractId: `CTR-CIB-${800 + Math.floor(Math.random() * 199)}`,
    });
  }),

  http.get(`*${WORKFLOW_BOARD_URL}`, async () => {
    await applyLatency();
    // Fresh copy each load so approve/decline don't permanently empty the seed.
    return HttpResponse.json({
      clearedThisWeek: workflowBoardSeed.clearedThisWeek,
      subscriptionRequests: workflowBoardSeed.subscriptionRequests.map((r) => ({ ...r })),
      proposedElements: workflowBoardSeed.proposedElements.map((p) => ({ ...p })),
      unmappedColumns: workflowBoardSeed.unmappedColumns.map((u) => ({ ...u })),
    });
  }),

  http.post(`*${WORKFLOW_APPROVE_URL}`, async ({ request }) => {
    await applyLatency();
    const body = (await request.json().catch(() => null)) as { requestId?: string } | null;
    const requestId = body?.requestId?.trim();
    if (!requestId) {
      return HttpResponse.json(
        { code: 'WORKFLOW_APPROVE_INVALID', message: 'requestId is required.' },
        { status: 400 },
      );
    }
    const hit = workflowBoardSeed.subscriptionRequests.find((r) => r.id === requestId);
    if (!hit) {
      return HttpResponse.json(
        { code: 'WORKFLOW_APPROVE_NOT_FOUND', message: 'Subscription request not found.' },
        { status: 404 },
      );
    }
    return HttpResponse.json({
      requestId,
      consumer: hit.consumer,
      contractId: `CTR-CIB-${3400 + Math.floor(Math.random() * 599)}`,
      subscriptionId: `SUB-CIB-${7100 + Math.floor(Math.random() * 899)}`,
      status: 'Active',
    });
  }),

  http.post(`*${WORKFLOW_DECLINE_URL}`, async ({ request }) => {
    await applyLatency();
    const body = (await request.json().catch(() => null)) as { requestId?: string } | null;
    const requestId = body?.requestId?.trim();
    if (!requestId) {
      return HttpResponse.json(
        { code: 'WORKFLOW_DECLINE_INVALID', message: 'requestId is required.' },
        { status: 400 },
      );
    }
    const hit = workflowBoardSeed.subscriptionRequests.find((r) => r.id === requestId);
    if (!hit) {
      return HttpResponse.json(
        { code: 'WORKFLOW_DECLINE_NOT_FOUND', message: 'Subscription request not found.' },
        { status: 404 },
      );
    }
    return HttpResponse.json({ requestId, status: 'Declined' });
  }),

  http.get(`*${DATASETS_URL}`, async () => {
    await applyLatency();
    return HttpResponse.json(physicalDatasets);
  }),
];
