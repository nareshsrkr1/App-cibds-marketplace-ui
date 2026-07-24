import type { CatalogueClassification, CatalogueStatus } from '../logicalModel/logicalModel.types';

export type GlossaryTerm = {
  id: string;
  name: string;
  definition: string;
  subjectAreaId: string;
  classification: CatalogueClassification;
  pii: boolean;
  status: CatalogueStatus;
  pdeCount: number;
  bdeIds: string[];
};

export type GlossaryTermsResponse = {
  terms: GlossaryTerm[];
};

export type GlossaryStatusFilter = 'All status' | CatalogueStatus;

export const GLOSSARY_STATUS_OPTIONS: GlossaryStatusFilter[] = ['All status', 'Endorsed', 'Proposed'];

export type GlossarySortKey = 'name' | 'bdes' | 'pdes';

export const GLOSSARY_SORT_OPTIONS: Array<{ value: GlossarySortKey; label: string }> = [
  { value: 'name', label: 'Name A-Z' },
  { value: 'bdes', label: 'BDEs ↓' },
  { value: 'pdes', label: 'PDEs ↓' },
];
