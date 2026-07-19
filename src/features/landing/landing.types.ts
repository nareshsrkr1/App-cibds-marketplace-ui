export type LandingMetricKey =
  | 'physical-datasets'
  | 'subject-areas'
  | 'logical-datasets'
  | 'data-elements'
  | 'business-terms';

export interface LandingMetric {
  key: LandingMetricKey;
  value: number;
  label: string;
}

export interface LandingMetricsResponse {
  stats: LandingMetric[];
}

/** @deprecated Use LandingMetric */
export type ProofStat = LandingMetric;

/** @deprecated Use LandingMetricsResponse */
export type LandingProofStats = LandingMetricsResponse;

export type Capability = {
  n: string;
  title: string;
  body: string;
  tags: string[];
  ai?: boolean;
  aiTag?: string;
};

export type PipelineStep = {
  n: string;
  title: string;
  body: string;
};

export type FaqItem = {
  q: string;
  a: string;
};

export type DiagramNode = {
  kind: 'app' | 'offer' | 'dataset' | 'contract' | 'sub';
  k: string;
  id: string;
  d: string;
  connLabel?: string;
  thinConn?: boolean;
};
