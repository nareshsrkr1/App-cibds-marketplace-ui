export type CatalogueClassification = 'Internal' | 'Confidential' | 'Restricted';

export type CatalogueStatus = 'Endorsed' | 'Proposed';

export type SubjectArea = {
  id: string;
  label: string;
  domain: string;
  subDomain: string;
  logicalDatasetCount: number;
  bdeCount: number;
  realisedCount: number;
  status: CatalogueStatus;
};

export type LogicalDataset = {
  id: string;
  name: string;
  subjectAreaId: string;
  bdeNames: string[];
  bdeCount: number;
  pdeCount: number;
};

export type LogicalModelResponse = {
  subjectAreas: SubjectArea[];
  logicalDatasets: LogicalDataset[];
};

export type BdeRealization = {
  datasetName: string;
  sor: string;
  columns: string[];
};

/**
 * Named distinctly from `bindColumns/bindColumns.bdeDetails.ts`'s `BindBdeDetail` — that's a
 * narrower "options for the column-binding wizard" shape, not this catalogue's full BDE record.
 */
export type CatalogueBdeDetail = {
  id: string;
  name: string;
  definition: string;
  domain: string;
  subDomain: string;
  subjectAreaId: string;
  logicalDatasetId: string;
  logicalDatasetName: string;
  classification: CatalogueClassification;
  pii: boolean;
  representation: string;
  isCde: boolean;
  status: CatalogueStatus;
  steward: string;
  pdeCount: number;
  datasetCount: number;
  realizations: BdeRealization[];
};

export type BusinessElementsResponse = {
  elements: CatalogueBdeDetail[];
};

export type SubjectAreaSortKey = 'name' | 'bdes' | 'realised';

export const SUBJECT_AREA_SORT_OPTIONS: Array<{ value: SubjectAreaSortKey; label: string }> = [
  { value: 'name', label: 'Name A-Z' },
  { value: 'bdes', label: 'BDEs ↓' },
  { value: 'realised', label: 'Realised ↓' },
];
