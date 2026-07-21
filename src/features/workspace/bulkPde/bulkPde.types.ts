export type BulkPdeApplication = {
  id: string;
  name: string;
  offerId: string;
};

export type BulkPdeApplicationsResponse = {
  applications: BulkPdeApplication[];
};

export type BulkPdeTemplateResponse = {
  columns: string[];
  sampleRow: string[];
  filename: string;
};

export type BulkPdeRow = {
  dataset: string;
  column: string;
  type: string;
  length: string;
  nullable: string;
  pii: string;
  sourceMapping: string;
  validValues: string;
  description: string;
};

export type BulkPdePreviewRequest = {
  applicationId: string;
};

export type BulkPdePreviewResponse = {
  rows: BulkPdeRow[];
};

export type BulkPdeRegisterRequest = {
  applicationId: string;
  offerId: string;
  rows: BulkPdeRow[];
};

export type BulkPdeMintedDataset = {
  name: string;
  dsId: string;
};

export type BulkPdeRegisterResponse = {
  count: number;
  offerId: string;
  datasets: BulkPdeMintedDataset[];
};

export type BulkPdeStage = 'setup' | 'review' | 'success';

/** How the review rows were produced — sample is preview-only. */
export type BulkPdeRowSource = 'file' | 'sample';
