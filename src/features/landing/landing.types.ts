export type ProofStat = {
  value: string;
  label: string;
};

export type LandingProofStats = {
  stats: ProofStat[];
};

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
