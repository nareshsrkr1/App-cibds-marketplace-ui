export type ConsoleKpi = {
  id: string;
  value: string | number;
  label: string;
  warn?: boolean;
};

export type ConsoleAction = {
  id: string;
  label: string;
  variant: 'primary' | 'secondary';
  enabled?: boolean;
};

export type ConsoleChart =
  | {
      id: string;
      title: string;
      subtitle: string;
      kind: 'bars';
      data: Record<string, number>;
      color?: string;
      footer?: string;
    }
  | {
      id: string;
      title: string;
      subtitle: string;
      kind: 'donut';
      realised: number;
      gap: number;
      footer?: string;
    }
  | {
      id: string;
      title: string;
      subtitle: string;
      kind: 'split';
      segments: Record<string, number>;
      footer?: string;
    }
  | {
      id: string;
      title: string;
      subtitle: string;
      kind: 'hbars';
      rows: Array<[string, number]>;
      footer?: string;
    };

export type ConsolePanelItem = {
  id: string;
  title: string;
  subtitle?: string;
  /** Trusted HTML fragment from mock API (matches HTML SoT lists). */
  subtitleHtml?: string;
  age?: string;
  tag?: string;
  tagKind?: 'proposed' | 'unmapped' | 'ok';
  approve?: boolean;
};

export type ConsolePanel = {
  id: string;
  title: string;
  moreLabel?: string;
  items: ConsolePanelItem[];
};

/** Hero: KPIs + actions + copy (greeting computed client-side). */
export type ConsoleHero = {
  persona: string;
  eyebrow: string;
  subtitle: string;
  displayName: string;
  greeting?: string;
  kpis: ConsoleKpi[];
  actions?: ConsoleAction[];
};

export type ConsoleChartsResponse = {
  persona: string;
  charts: ConsoleChart[];
};

export type ConsolePanelResponse = {
  persona: string;
  panel: ConsolePanel;
};

/** @deprecated Combined console payload — prefer section types. */
export type ConsoleSummary = ConsoleHero & {
  charts?: ConsoleChart[];
  panels?: ConsolePanel[];
  actionItems?: Array<{
    id: string;
    title: string;
    subtitle: string;
    age?: string;
    tag?: string;
    tagKind?: 'proposed' | 'unmapped' | 'ok';
  }>;
  recentActivity?: Array<{
    id: string;
    title: string;
    detail: string;
    by?: string;
    age?: string;
  }>;
  summaries?: Array<{ id: string; title: string; body: string }>;
};
