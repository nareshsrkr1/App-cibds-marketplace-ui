export type BindSrcType = 's3' | 'other';
export type BindReviewPath = 'steward' | 'self';
export type BindStep = 'source' | 'harvest' | 'bind' | 'publish' | 'review' | 'success';
export type BindFilter = 'all' | 'unbound' | 'suggested' | 'manual' | 'pii';
export type BindMethod = 's' | 'm' | 'n' | 'p';

export type BindDataset = {
  dsId: string;
  name: string;
  s3Prefix: string;
  classification: string;
};

export type BindApplicationGroup = {
  name: string;
  appId: string;
  offerId: string;
  datasets: BindDataset[];
};

export type BindDatasetsResponse = {
  applications: BindApplicationGroup[];
};

export type BindResolvedDataset = BindDataset & {
  app: string;
  appId: string;
  offerId: string;
};

export type BindColumn = {
  col: string;
  type: string;
  len: string;
  nul: string;
  vals: string;
  srcmap: string;
  orig: string;
  pii: string;
  /** Currently selected BDE label, or Proposed: Name */
  suggest: string;
  method: BindMethod;
  /** Original suggested BDE from harvest (for Accept all suggested). */
  suggestedBde: string;
  profile?: string;
  proposed?: boolean;
  propose?: boolean;
  proposeName?: string;
  proposeDef?: string;
  golden?: boolean;
  cde?: boolean;
  xform?: string;
  uom?: string;
};

export type BindBdeDetail = {
  def: string;
  sa: string;
  cls: string;
  pii: string;
};

export type BindHarvestResponse = {
  columns: Array<Omit<BindColumn, 'suggestedBde' | 'proposed' | 'propose' | 'proposeName' | 'proposeDef'> & {
    suggest: string;
    method: BindMethod;
  }>;
};

export type BindBdeOptionsResponse = {
  options: string[];
};

export type BindPublishRequest = {
  datasetId: string;
  offerId: string;
  contractName: string;
  reviewPath: BindReviewPath;
  columns: Array<{
    col: string;
    type: string;
    len: string;
    nul: string;
    srcmap: string;
    orig: string;
    vals: string;
    pii: string;
    boundTo: string;
    bindMethod: string;
  }>;
};

export type BindPublishResponse = {
  datasetId: string;
  datasetName: string;
  offerId: string;
  boundCount: number;
  totalColumns: number;
  reviewPath: BindReviewPath;
  contractId: string;
};

export const BIND_STEPS: Array<{ id: Exclude<BindStep, 'success'>; label: string }> = [
  { id: 'source', label: 'Source' },
  { id: 'harvest', label: 'Harvest' },
  { id: 'bind', label: 'Bind' },
  { id: 'publish', label: 'Publish' },
  { id: 'review', label: 'Review' },
];
