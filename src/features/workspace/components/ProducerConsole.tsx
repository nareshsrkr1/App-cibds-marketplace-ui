import { Spinner } from '../../../components/feedback/Spinner/Spinner';
import { personalizedGreeting } from '../greeting';
import type {
  ConsoleChart,
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
  chartsStatus: SectionStatus;
  chartsError?: string | null;
  subscriptionPanel: ConsolePanel | null;
  subscriptionStatus: SectionStatus;
  subscriptionError?: string | null;
  governancePanel: ConsolePanel | null;
  governanceStatus: SectionStatus;
  governanceError?: string | null;
};

function SectionStatusBlock({
  status,
  error,
  emptyLabel,
  loadingLabel,
}: {
  status: SectionStatus;
  error?: string | null;
  emptyLabel: string;
  loadingLabel: string;
}) {
  if (status === 'loading') {
    return (
      <div className="console-section-status" role="status" aria-label={loadingLabel}>
        <Spinner size="sm" label={loadingLabel} />
      </div>
    );
  }
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

export function ProducerConsole({
  hero,
  charts,
  chartsStatus,
  chartsError,
  subscriptionPanel,
  subscriptionStatus,
  subscriptionError,
  governancePanel,
  governanceStatus,
  governanceError,
}: ProducerConsoleProps) {
  const actions = hero.actions ?? [];
  const greeting = personalizedGreeting(hero.displayName);

  return (
    <div className="producer-console" data-testid="producer-console">
      <ConsoleHeader
        eyebrow={hero.eyebrow}
        greeting={greeting}
        subtitle={hero.subtitle}
      />

      <div className="sh-kpis" aria-label="Producer KPIs">
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
            >
              {a.label}
            </button>
          ))}
        </div>
      ) : null}

      {chartsStatus === 'ready' ? (
        <ConsoleCharts charts={charts} />
      ) : (
        <div className="sh-charts">
          <SectionStatusBlock
            status={chartsStatus}
            error={chartsError}
            emptyLabel="No statistics to show yet."
            loadingLabel="Loading statistics"
          />
        </div>
      )}

      <div className="sh-cols">
        {subscriptionStatus === 'ready' && subscriptionPanel ? (
          <ConsolePanelBlock panel={subscriptionPanel} />
        ) : (
          <div className="sh-block">
            <div className="sh-bh">
              <h3>Subscription requests · awaiting your approval</h3>
            </div>
            <SectionStatusBlock
              status={subscriptionStatus}
              error={subscriptionError}
              emptyLabel="Nothing here yet."
              loadingLabel="Loading subscription requests"
            />
          </div>
        )}

        {governanceStatus === 'ready' && governancePanel ? (
          <ConsolePanelBlock panel={governancePanel} />
        ) : (
          <div className="sh-block">
            <div className="sh-bh">
              <h3>Sent to governance</h3>
            </div>
            <SectionStatusBlock
              status={governanceStatus}
              error={governanceError}
              emptyLabel="Nothing here yet."
              loadingLabel="Loading governance items"
            />
          </div>
        )}
      </div>
    </div>
  );
}
