import DOMPurify from 'dompurify';
import { resolveFeatureEnabled } from '../../app/config/featureFlags';
import type { NavGroup, NavItem, WorkspaceNavResponse } from './nav.types';
import type {
  ConsoleAction,
  ConsoleChart,
  ConsoleChartTier,
  ConsoleChartsResponse,
  ConsoleHero,
  ConsoleKpi,
  ConsolePanel,
  ConsolePanelItem,
  ConsolePanelResponse,
} from './workspace.types';

const CHART_KINDS = new Set(['bars', 'donut', 'split', 'hbars', 'gauge', 'trend']);

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function adaptNavItem(raw: unknown): NavItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' || typeof r.label !== 'string') return null;
  return {
    id: r.id,
    label: r.label,
    icon: typeof r.icon === 'string' ? r.icon : undefined,
    enabled: resolveFeatureEnabled(r.id, Boolean(r.enabled)),
    active: typeof r.active === 'boolean' ? r.active : undefined,
    badge: typeof r.badge === 'string' ? r.badge : undefined,
  };
}

function adaptNavGroup(raw: unknown): NavGroup | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' || typeof r.label !== 'string') return null;
  return {
    id: r.id,
    label: r.label,
    sub: typeof r.sub === 'boolean' ? r.sub : undefined,
    items: asArray<unknown>(r.items)
      .map(adaptNavItem)
      .filter((item): item is NavItem => item !== null),
  };
}

/** Defensive normalization so a real backend's shape can drift from the mock's without crashing the UI. */
export function adaptWorkspaceNav(raw: WorkspaceNavResponse): WorkspaceNavResponse {
  return {
    persona: asString(raw.persona),
    groups: asArray<unknown>(raw.groups)
      .map(adaptNavGroup)
      .filter((group): group is NavGroup => group !== null),
  };
}

function adaptKpi(raw: unknown): ConsoleKpi | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' || typeof r.label !== 'string') return null;
  if (typeof r.value !== 'string' && typeof r.value !== 'number') return null;
  return {
    id: r.id,
    value: r.value,
    label: r.label,
    warn: typeof r.warn === 'boolean' ? r.warn : undefined,
  };
}

function adaptAction(raw: unknown): ConsoleAction | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' || typeof r.label !== 'string') return null;
  const variant = r.variant === 'primary' || r.variant === 'secondary' ? r.variant : 'secondary';
  const rawEnabled = typeof r.enabled === 'boolean' ? r.enabled : true;
  return {
    id: r.id,
    label: r.label,
    variant,
    enabled: resolveFeatureEnabled(r.id, rawEnabled),
  };
}

/** Defensive normalization so a real backend's shape can drift from the mock's without crashing the UI. */
export function adaptConsoleHero(raw: ConsoleHero): ConsoleHero {
  return {
    persona: asString(raw.persona),
    eyebrow: asString(raw.eyebrow),
    subtitle: asString(raw.subtitle),
    displayName: asString(raw.displayName),
    greeting: typeof raw.greeting === 'string' ? raw.greeting : undefined,
    kpis: asArray<unknown>(raw.kpis)
      .map(adaptKpi)
      .filter((kpi): kpi is ConsoleKpi => kpi !== null),
    actions: raw.actions
      ? asArray<unknown>(raw.actions)
          .map(adaptAction)
          .filter((action): action is ConsoleAction => action !== null)
      : undefined,
  };
}

function adaptChart(raw: unknown): ConsoleChart | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (
    typeof r.id !== 'string' ||
    typeof r.title !== 'string' ||
    typeof r.subtitle !== 'string' ||
    typeof r.kind !== 'string' ||
    !CHART_KINDS.has(r.kind)
  ) {
    return null;
  }
  // Shape validated only down to the discriminant; per-kind fields are trusted from
  // there, same as the rest of this defensive layer (catch garbage, don't re-derive types).
  return r as unknown as ConsoleChart;
}

function adaptChartTier(raw: unknown): ConsoleChartTier | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' || typeof r.label !== 'string') return null;
  return {
    id: r.id,
    label: r.label,
    chartIds: asArray<unknown>(r.chartIds).filter((id): id is string => typeof id === 'string'),
    heading: r.heading === 'section' ? 'section' : r.heading === 'tier' ? 'tier' : undefined,
  };
}

/** Defensive normalization so a real backend's shape can drift from the mock's without crashing the UI. */
export function adaptConsoleCharts(raw: ConsoleChartsResponse): ConsoleChartsResponse {
  return {
    persona: asString(raw.persona),
    tiers: raw.tiers
      ? asArray<unknown>(raw.tiers)
          .map(adaptChartTier)
          .filter((tier): tier is ConsoleChartTier => tier !== null)
      : undefined,
    charts: asArray<unknown>(raw.charts)
      .map(adaptChart)
      .filter((chart): chart is ConsoleChart => chart !== null),
  };
}

/** Only the inline emphasis/mono-chip markup the panel item template actually uses. */
const SUBTITLE_HTML_ALLOWED_TAGS = ['b', 'strong', 'em', 'span'];
const SUBTITLE_HTML_ALLOWED_ATTR = ['class'];

function adaptPanelItem(raw: unknown): ConsolePanelItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' || typeof r.title !== 'string') return null;
  const item = r as unknown as ConsolePanelItem;
  if (typeof item.subtitleHtml !== 'string') return item;
  return {
    ...item,
    subtitleHtml: DOMPurify.sanitize(item.subtitleHtml, {
      ALLOWED_TAGS: SUBTITLE_HTML_ALLOWED_TAGS,
      ALLOWED_ATTR: SUBTITLE_HTML_ALLOWED_ATTR,
    }),
  };
}

function adaptPanel(raw: unknown): ConsolePanel {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    id: asString(r.id),
    title: asString(r.title),
    moreLabel: typeof r.moreLabel === 'string' ? r.moreLabel : undefined,
    items: asArray<unknown>(r.items)
      .map(adaptPanelItem)
      .filter((item): item is ConsolePanelItem => item !== null),
  };
}

/** Defensive normalization so a real backend's shape can drift from the mock's without crashing the UI. */
export function adaptConsolePanel(raw: ConsolePanelResponse): ConsolePanelResponse {
  return {
    persona: asString(raw.persona),
    panel: adaptPanel(raw.panel),
  };
}
