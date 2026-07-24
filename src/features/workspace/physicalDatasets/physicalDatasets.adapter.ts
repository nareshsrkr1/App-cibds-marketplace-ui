import type {
  PhysicalDataset,
  PhysicalDatasetClassification,
  PhysicalDatasetsResponse,
  PhysicalDatasetSor,
} from './physicalDatasets.types';

const SORS = new Set<PhysicalDatasetSor>(['Endur', 'Catalyst']);
const CLASSIFICATIONS = new Set<PhysicalDatasetClassification>([
  'Internal',
  'Confidential',
  'Restricted',
]);

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function clampPercent(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function adaptDataset(raw: unknown): PhysicalDataset | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.dsId !== 'string' || typeof r.name !== 'string') return null;

  const sor = SORS.has(r.sor as PhysicalDatasetSor) ? (r.sor as PhysicalDatasetSor) : 'Endur';
  const classification = CLASSIFICATIONS.has(r.classification as PhysicalDatasetClassification)
    ? (r.classification as PhysicalDatasetClassification)
    : 'Internal';

  return {
    dsId: r.dsId,
    name: r.name,
    sourceFile: asString(r.sourceFile),
    sor,
    owner: asString(r.owner),
    hostingApp: asString(r.hostingApp),
    classification,
    status: asString(r.status, 'Published'),
    columnCount: typeof r.columnCount === 'number' ? r.columnCount : 0,
    boundPercent: clampPercent(r.boundPercent),
    tier: asString(r.tier),
    hasGap: Boolean(r.hasGap),
  };
}

/** Defensive normalization so a real backend's shape can drift from the mock's without crashing the UI. */
export function adaptPhysicalDatasets(raw: PhysicalDatasetsResponse): PhysicalDatasetsResponse {
  const list = Array.isArray(raw?.datasets) ? raw.datasets : [];
  return {
    datasets: list.map(adaptDataset).filter((d): d is PhysicalDataset => d !== null),
  };
}
