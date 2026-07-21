import { personalizedGreeting } from '../greeting';
import type {
  ConsoleChart,
  ConsoleChartTier,
  ConsoleHero,
  ConsolePanel,
} from '../workspace.types';
import { ConsoleCharts } from './ConsoleCharts';
import { ConsoleHeader } from './ConsoleHeader';
import { ConsolePanelBlock } from './ConsolePanelBlock';

export type SectionStatus = 'loading' | 'ready' | 'empty' | 'error';

export type ProducerConsoleProps = {
  hero: ConsoleHero;
  charts: ConsoleChart[];
  chartTiers?: ConsoleChartTier[];
  chartsStatus: SectionStatus;
  chartsError?: string | null;
  primaryPanel: ConsolePanel | null;
  primaryStatus: SectionStatus;
  primaryError?: string | null;
  primaryEmptyTitle?: string;
  secondaryPanel: ConsolePanel | null;
  secondaryStatus: SectionStatus;
  secondaryError?: string | null;
  secondaryEmptyTitle?: string;
  /** Soft enter animation for charts/panels only (hero stays put). */
  bodyStageClass?: string;
  onAction?: (id: string) => void;
};

/** Hide section while loading; show error/empty only when settled. */
function SectionMessage({
  status,
  error,
  emptyLabel,
}: {
  status: SectionStatus;
  error?: string | null;
  emptyLabel: string;
}) {
  if (status === 'loading') return null;
  if (status === 'error') {
    return (
      <div className="console-section-status console-section-status--error" role="alert">
        {error ?? 'Unable to load this section.'}
      </div>
    );
  }
  if (status === 'empty') {
    return <p className="sh-empty">{emptyLabel}</p>;
  }
  return null;
}

function PanelSlot({
  panel,
  status,
  error,
  emptyTitle,
  onMore,
}: {
  panel: ConsolePanel | null;
  status: SectionStatus;
  error?: string | null;
  emptyTitle: string;
  onMore?: () => void;
}) {
  if (status === 'loading' || status === 'empty') return null;
  if (status === 'ready' && panel) {
    return <ConsolePanelBlock panel={panel} onMore={onMore} />;
  }
  if (status === 'error') {
    return (
      <div className="sh-block">
        <div className="sh-bh">
          <h3>{emptyTitle}</h3>
        </div>
        <SectionMessage status={status} error={error} emptyLabel="Nothing here yet." />
      </div>
    );
  }
  return null;
}

export function ProducerConsole({
  hero,
  charts,
  chartTiers,
  chartsStatus,
  chartsError,
  primaryPanel,
  primaryStatus,
  primaryError,
  primaryEmptyTitle = 'Panel',
  secondaryPanel,
  secondaryStatus,
  secondaryError,
  secondaryEmptyTitle = 'Panel',
  bodyStageClass = '',
  onAction,
}: ProducerConsoleProps) {
  const actions = hero.actions ?? [];
  const greeting = personalizedGreeting(hero.displayName);
  const showPrimary = primaryStatus === 'ready' || primaryStatus === 'error';
  const showSecondary = secondaryStatus === 'ready' || secondaryStatus === 'error';
  const showPanels = showPrimary || showSecondary;
  const showBody =
    chartsStatus === 'ready' ||
    chartsStatus === 'error' ||
    chartsStatus === 'empty' ||
    showPanels;

  return (
    <div className="producer-console" data-testid="producer-console">
      {/* Static shell — greeting / KPIs / actions stay visible across persona switches */}
      <ConsoleHeader
        eyebrow={hero.eyebrow}
        greeting={greeting}
        subtitle={hero.subtitle}
      />

      <div className="sh-kpis" aria-label="Console KPIs">
        {hero.kpis.map((k) => (
          <div key={k.id} className={`sh-kpi${k.warn ? ' warn' : ''}`}>
            <span className="kn">{k.value}</span>
            <span className="kl">{k.label}</span>
          </div>
        ))}
      </div>

      {actions.length > 0 ? (
        <div className="sh-actions" aria-label="Console actions">
          {actions.map((a) => (
            <button
              key={a.id}
              type="button"
              className={a.variant === 'primary' ? 'btn-dk' : 'btn-lt'}
              disabled={a.enabled === false}
              title={a.enabled === false ? 'Available in a future release' : a.label}
              onClick={() => {
                if (a.enabled !== false) onAction?.(a.id);
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
      ) : null}

      {showBody ? (
        <div className={`console-body-stage ${bodyStageClass}`.trim()}>
          {chartsStatus === 'ready' ? (
            <ConsoleCharts charts={charts} tiers={chartTiers} />
          ) : chartsStatus === 'error' || chartsStatus === 'empty' ? (
            <div className="sh-charts">
              <SectionMessage
                status={chartsStatus}
                error={chartsError}
                emptyLabel="No statistics to show yet."
              />
            </div>
          ) : null}

          {showPanels ? (
            <div className="sh-cols">
              {showPrimary ? (
                <PanelSlot
                  panel={primaryPanel}
                  status={primaryStatus}
                  error={primaryError}
                  emptyTitle={primaryEmptyTitle}
                />
              ) : null}
              {showSecondary ? (
                <PanelSlot
                  panel={secondaryPanel}
                  status={secondaryStatus}
                  error={secondaryError}
                  emptyTitle={secondaryEmptyTitle}
                  onMore={
                    secondaryPanel?.id === 'subreq'
                      ? () => onAction?.('workflow')
                      : undefined
                  }
                />
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
