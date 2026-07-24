export type PhysicalDatasetSor = 'Endur' | 'Catalyst';

export type PhysicalDatasetClassification = 'Internal' | 'Confidential' | 'Restricted';

export type PhysicalDataset = {
  dsId: string;
  name: string;
  sourceFile: string;
  sor: PhysicalDatasetSor;
  owner: string;
  hostingApp: string;
  classification: PhysicalDatasetClassification;
  status: string;
  columnCount: number;
  boundPercent: number;
  tier: string;
  hasGap: boolean;
};

export type PhysicalDatasetsResponse = {
  datasets: PhysicalDataset[];
};

export type PhysicalDatasetSortKey = 'name' | 'columns' | 'bound';

export type PhysicalDatasetViewMode = 'list' | 'grid';

export const SOR_FILTER_OPTIONS = ['All SOR', 'Endur', 'Catalyst'] as const;

export const CLASSIFICATION_FILTER_OPTIONS = [
  'All classification',
  'Internal',
  'Confidential',
  'Restricted',
] as const;

export const SORT_OPTIONS: Array<{ value: PhysicalDatasetSortKey; label: string }> = [
  { value: 'name', label: 'Name A-Z' },
  { value: 'columns', label: 'Cols ↓' },
  { value: 'bound', label: 'Binding ↓' },
];
