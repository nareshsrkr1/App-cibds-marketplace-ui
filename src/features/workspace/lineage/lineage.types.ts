import type { CatalogueClassification, CatalogueStatus } from '../logicalModel/logicalModel.types';

export type LineageDatasetSummary = {
  datasetName: string;
  sor: string;
  columnCount: number;
};

/** Lightweight shape — enough to draw the Sankey diagram immediately when a modal opens. */
export type LineageSummary = {
  key: string;
  term: string;
  bdeName: string;
  bdeId: string;
  logicalDatasetName: string;
  datasets: LineageDatasetSummary[];
  columnCount: number;
};

export type LineageSummaryResponse = {
  entries: LineageSummary[];
};

export type LineageColumnDetail = {
  name: string;
  type: string;
  nullable: boolean;
};

export type LineageDatasetDetail = {
  datasetName: string;
  sor: string;
  columns: LineageColumnDetail[];
};

/** Heavy, per-column shape — fetched once, read only after a user clicks a diagram node. */
export type LineageDetail = {
  key: string;
  term: string;
  bdeId: string;
  subjectArea: string;
  subDomain: string;
  classification: CatalogueClassification;
  pii: boolean;
  status: CatalogueStatus;
  definition: string;
  logicalDatasetName: string;
  datasets: LineageDatasetDetail[];
};

export type LineageDetailsResponse = {
  entries: LineageDetail[];
};
