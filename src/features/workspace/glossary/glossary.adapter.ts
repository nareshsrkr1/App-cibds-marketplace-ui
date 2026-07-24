import type { CatalogueClassification, CatalogueStatus } from '../logicalModel/logicalModel.types';
import type { GlossaryTerm, GlossaryTermsResponse } from './glossary.types';

const CLASSIFICATIONS = new Set<CatalogueClassification>(['Internal', 'Confidential', 'Restricted']);
const STATUSES = new Set<CatalogueStatus>(['Endorsed', 'Proposed']);

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function adaptTerm(raw: unknown): GlossaryTerm | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' || typeof r.name !== 'string') return null;
  return {
    id: r.id,
    name: r.name,
    definition: asString(r.definition),
    subjectAreaId: asString(r.subjectAreaId),
    classification: CLASSIFICATIONS.has(r.classification as CatalogueClassification)
      ? (r.classification as CatalogueClassification)
      : 'Internal',
    pii: Boolean(r.pii),
    status: STATUSES.has(r.status as CatalogueStatus) ? (r.status as CatalogueStatus) : 'Proposed',
    pdeCount: asNumber(r.pdeCount),
    bdeIds: Array.isArray(r.bdeIds) ? r.bdeIds.filter((id): id is string => typeof id === 'string') : [],
  };
}

/** Defensive normalization so a real backend's shape can drift from the mock's without crashing the UI. */
export function adaptGlossaryTerms(raw: GlossaryTermsResponse): GlossaryTermsResponse {
  const list = Array.isArray(raw?.terms) ? raw.terms : [];
  return {
    terms: list.map(adaptTerm).filter((t): t is GlossaryTerm => t !== null),
  };
}
