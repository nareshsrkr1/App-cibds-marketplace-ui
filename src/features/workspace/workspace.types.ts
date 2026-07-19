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

export type ConsoleSummary = {
  persona: string;
  eyebrow: string;
  greeting: string;
  subtitle: string;
  displayName: string;
  kpis: ConsoleKpi[];
  actions?: ConsoleAction[];
  charts?: ConsoleChart[];
  panels?: ConsolePanel[];
  /** Legacy admin-shaped fields (optional). */
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
