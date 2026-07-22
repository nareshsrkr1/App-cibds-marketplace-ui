export const REG_STEPS = [
  { id: 'describe', ph: 'Dataset', label: 'Describe' },
  { id: 'context', ph: 'Dataset', label: 'Context' },
  { id: 'physical', ph: 'Dataset', label: 'Physical' },
  { id: 'restrict', ph: 'Governance', label: 'Restrict' },
  { id: 'steward', ph: 'Governance', label: 'Stewardship' },
  { id: 'tech', ph: 'Technical', label: 'Technical' },
  { id: 'schedule', ph: 'Technical', label: 'Schedule' },
  { id: 'review', ph: 'Review', label: 'Review' },
] as const;

export type RegStepId = (typeof REG_STEPS)[number]['id'];

export const REG_USECASES = [
  'Clean P&L for Markets',
  'Counterparty Credit & XVA',
  'TRACE / MSRB Reporting',
  'Position Keeping',
  'Regulatory Reporting',
  'Risk Aggregation',
] as const;

export type RegisterFormState = {
  step: number;
  app: string;
  name: string;
  shortDesc: string;
  desc: string;
  hostApp: string;
  hostType: string;
  prodApps: string;
  sor: string;
  tier: string;
  retention: string;
  useCases: string[];
  restrict: string;
  rep: string;
  cadence: string;
  pattern: string;
  subtype: string;
  freq: string;
  tz: string;
  slaStart: string;
  slaEnd: string;
  steward: string;
  owner: string;
  dsId: string;
  offerId: string;
  appId: string;
  minted: boolean;
};

export function createInitialRegisterState(): RegisterFormState {
  return {
    step: 0,
    app: '',
    name: '',
    shortDesc: '',
    desc: '',
    hostApp: '',
    hostType: 'SOR',
    prodApps: '',
    sor: 'Endur',
    tier: 'Tier 1 — Authoritative',
    retention: '7 years',
    useCases: [],
    restrict: 'Internal use',
    rep: 'Internal',
    cadence: 'Batch',
    pattern: 'Snap',
    subtype: 'Snap as Feed',
    freq: 'Daily',
    tz: 'America/New_York',
    slaStart: '0 6 * * *',
    slaEnd: '0 8 * * *',
    steward: 'Data Governance',
    owner: '',
    dsId: '',
    offerId: '',
    appId: '',
    minted: false,
  };
}

export const HOST_TYPES = ['SOR', 'SOO', 'Strategic ADS', 'Non-Strategic Aggregator'] as const;
export const SOR_OPTIONS = ['Endur', 'Catalyst', 'Other'] as const;
export const TIER_OPTIONS = [
  'Tier 1 — Authoritative',
  'Tier 2 — Provisioned',
  'Tier 3 — Derived',
] as const;
export const RETENTION_OPTIONS = ['3 years', '5 years', '7 years', '10 years', 'Indefinite'] as const;
export const RESTRICT_OPTIONS = [
  'Internal use',
  'Confidential — need to know',
  'Restricted — entitlement required',
  'Public (within firm)',
] as const;
export const STEWARD_OPTIONS = ['Data Governance', 'Data Management'] as const;
export const CLASS_OPTIONS = ['Internal', 'Confidential', 'Public', 'PII'] as const;
export const CADENCE_OPTIONS = ['Batch', 'Intraday', 'Real-time'] as const;
export const PATTERN_OPTIONS = ['Snap', 'Stream'] as const;
export const SUBTYPE_OPTIONS = ['Snap as Feed', 'Snap as Stream', 'Stream as Event'] as const;
export const FREQ_OPTIONS = ['Daily', 'Intraday', 'Weekly', 'Monthly', 'On demand'] as const;
export const TZ_OPTIONS = ['America/New_York', 'Europe/London', 'Asia/Singapore', 'UTC'] as const;
