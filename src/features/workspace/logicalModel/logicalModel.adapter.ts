import type {
  BdeRealization,
  BusinessElementsResponse,
  CatalogueBdeDetail,
  CatalogueClassification,
  CatalogueStatus,
  LogicalDataset,
  LogicalModelResponse,
  SubjectArea,
} from './logicalModel.types';

const CLASSIFICATIONS = new Set<CatalogueClassification>(['Internal', 'Confidential', 'Restricted']);
const STATUSES = new Set<CatalogueStatus>(['Endorsed', 'Proposed']);

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asClassification(value: unknown): CatalogueClassification {
  return CLASSIFICATIONS.has(value as CatalogueClassification)
    ? (value as CatalogueClassification)
    : 'Internal';
}

function asStatus(value: unknown): CatalogueStatus {
  return STATUSES.has(value as CatalogueStatus) ? (value as CatalogueStatus) : 'Proposed';
}

function adaptSubjectArea(raw: unknown): SubjectArea | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' || typeof r.label !== 'string') return null;
  return {
    id: r.id,
    label: r.label,
    domain: asString(r.domain),
    subDomain: asString(r.subDomain),
    logicalDatasetCount: asNumber(r.logicalDatasetCount),
    bdeCount: asNumber(r.bdeCount),
    realisedCount: asNumber(r.realisedCount),
    status: asStatus(r.status),
  };
}

function adaptLogicalDataset(raw: unknown): LogicalDataset | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' || typeof r.name !== 'string') return null;
  return {
    id: r.id,
    name: r.name,
    subjectAreaId: asString(r.subjectAreaId),
    bdeNames: Array.isArray(r.bdeNames) ? r.bdeNames.filter((n): n is string => typeof n === 'string') : [],
    bdeCount: asNumber(r.bdeCount),
    pdeCount: asNumber(r.pdeCount),
  };
}

/** Defensive normalization so a real backend's shape can drift from the mock's without crashing the UI. */
export function adaptLogicalModel(raw: LogicalModelResponse): LogicalModelResponse {
  const subjectAreas = Array.isArray(raw?.subjectAreas) ? raw.subjectAreas : [];
  const logicalDatasets = Array.isArray(raw?.logicalDatasets) ? raw.logicalDatasets : [];
  return {
    subjectAreas: subjectAreas.map(adaptSubjectArea).filter((a): a is SubjectArea => a !== null),
    logicalDatasets: logicalDatasets
      .map(adaptLogicalDataset)
      .filter((d): d is LogicalDataset => d !== null),
  };
}

function adaptRealization(raw: unknown): BdeRealization | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.datasetName !== 'string') return null;
  return {
    datasetName: r.datasetName,
    sor: asString(r.sor),
    columns: Array.isArray(r.columns) ? r.columns.filter((c): c is string => typeof c === 'string') : [],
  };
}

function adaptBde(raw: unknown): CatalogueBdeDetail | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' || typeof r.name !== 'string') return null;
  return {
    id: r.id,
    name: r.name,
    definition: asString(r.definition),
    domain: asString(r.domain),
    subDomain: asString(r.subDomain),
    subjectAreaId: asString(r.subjectAreaId),
    logicalDatasetId: asString(r.logicalDatasetId),
    logicalDatasetName: asString(r.logicalDatasetName),
    classification: asClassification(r.classification),
    pii: Boolean(r.pii),
    representation: asString(r.representation),
    isCde: Boolean(r.isCde),
    status: asStatus(r.status),
    steward: asString(r.steward),
    pdeCount: asNumber(r.pdeCount),
    datasetCount: asNumber(r.datasetCount),
    realizations: Array.isArray(r.realizations)
      ? r.realizations.map(adaptRealization).filter((x): x is BdeRealization => x !== null)
      : [],
  };
}

/** Defensive normalization so a real backend's shape can drift from the mock's without crashing the UI. */
export function adaptBusinessElements(raw: BusinessElementsResponse): BusinessElementsResponse {
  const elements = Array.isArray(raw?.elements) ? raw.elements : [];
  return {
    elements: elements.map(adaptBde).filter((e): e is CatalogueBdeDetail => e !== null),
  };
}
