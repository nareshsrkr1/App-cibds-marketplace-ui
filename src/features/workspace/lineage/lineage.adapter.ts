import type { CatalogueClassification, CatalogueStatus } from '../logicalModel/logicalModel.types';
import type {
  LineageDatasetDetail,
  LineageDatasetSummary,
  LineageDetail,
  LineageDetailsResponse,
  LineageSummary,
  LineageSummaryResponse,
} from './lineage.types';

const CLASSIFICATIONS = new Set<CatalogueClassification>(['Internal', 'Confidential', 'Restricted']);
const STATUSES = new Set<CatalogueStatus>(['Endorsed', 'Proposed']);

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function adaptDatasetSummary(raw: unknown): LineageDatasetSummary | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.datasetName !== 'string') return null;
  return { datasetName: r.datasetName, sor: asString(r.sor), columnCount: asNumber(r.columnCount) };
}

function adaptSummary(raw: unknown): LineageSummary | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.key !== 'string') return null;
  return {
    key: r.key,
    term: asString(r.term, r.key),
    bdeName: asString(r.bdeName, r.key),
    bdeId: asString(r.bdeId),
    logicalDatasetName: asString(r.logicalDatasetName),
    datasets: Array.isArray(r.datasets)
      ? r.datasets.map(adaptDatasetSummary).filter((d): d is LineageDatasetSummary => d !== null)
      : [],
    columnCount: asNumber(r.columnCount),
  };
}

/** Defensive normalization so a real backend's shape can drift from the mock's without crashing the UI. */
export function adaptLineageSummaries(raw: LineageSummaryResponse): LineageSummaryResponse {
  const list = Array.isArray(raw?.entries) ? raw.entries : [];
  return { entries: list.map(adaptSummary).filter((e): e is LineageSummary => e !== null) };
}

function adaptDatasetDetail(raw: unknown): LineageDatasetDetail | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.datasetName !== 'string') return null;
  const columns = Array.isArray(r.columns)
    ? r.columns
        .map((c): { name: string; type: string; nullable: boolean } | null => {
          if (!c || typeof c !== 'object') return null;
          const cr = c as Record<string, unknown>;
          if (typeof cr.name !== 'string') return null;
          return { name: cr.name, type: asString(cr.type), nullable: Boolean(cr.nullable) };
        })
        .filter((c): c is { name: string; type: string; nullable: boolean } => c !== null)
    : [];
  return { datasetName: r.datasetName, sor: asString(r.sor), columns };
}

function adaptDetail(raw: unknown): LineageDetail | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.key !== 'string') return null;
  return {
    key: r.key,
    term: asString(r.term, r.key),
    bdeId: asString(r.bdeId),
    subjectArea: asString(r.subjectArea),
    subDomain: asString(r.subDomain),
    classification: CLASSIFICATIONS.has(r.classification as CatalogueClassification)
      ? (r.classification as CatalogueClassification)
      : 'Internal',
    pii: Boolean(r.pii),
    status: STATUSES.has(r.status as CatalogueStatus) ? (r.status as CatalogueStatus) : 'Proposed',
    definition: asString(r.definition),
    logicalDatasetName: asString(r.logicalDatasetName),
    datasets: Array.isArray(r.datasets)
      ? r.datasets.map(adaptDatasetDetail).filter((d): d is LineageDatasetDetail => d !== null)
      : [],
  };
}

/** Defensive normalization so a real backend's shape can drift from the mock's without crashing the UI. */
export function adaptLineageDetails(raw: LineageDetailsResponse): LineageDetailsResponse {
  const list = Array.isArray(raw?.entries) ? raw.entries : [];
  return { entries: list.map(adaptDetail).filter((e): e is LineageDetail => e !== null) };
}
